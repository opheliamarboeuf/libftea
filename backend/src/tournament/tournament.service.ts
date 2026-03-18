import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { hasPermission } from 'src/auth/permissions';
import { Role } from '@prisma/client';

@Injectable()
export class TournamentService {
	constructor(private readonly prisma: PrismaService) {}
	// async = attend une reponse lente
	async createTournament(data: CreateTournamentDto, userId: number, userRole: Role){
		if ( !hasPermission(userRole, "CREATE_TOURNAMENT"))
			throw new BadRequestException("You do not have the right to create a tournament");
				const now = new Date();
		if (new Date(data.endDate) <= now)
			throw new BadRequestException("Tournament end date must be in the future");
		if (new Date(data.startDate) > new Date(data.endDate))
			throw new BadRequestException("Start date must be before end date");

	const overlappingBattle = await this.prisma.battle.findFirst({
		where: {
			status: { in: ["ACTIVE", "UPCOMING"] },
			startsAt: { lte: new Date(data.endDate) },
			endsAt: { gte: new Date(data.startDate) },
		},
	});
	if (overlappingBattle)
		throw new BadRequestException(
			`A tournament is already planned from ${overlappingBattle.startsAt.toLocaleDateString()} to ${overlappingBattle.endsAt.toLocaleDateString()}`
    );
		try
		{
			const battle = await this.prisma.$transaction(async (prisma) =>
			{
				const newBattle = await prisma.battle.create({
					data: {
						theme: data.theme,
						startsAt: new Date(data.startDate),
						endsAt: new Date(data.endDate),
						createdById: userId,
					},
				});
				await prisma.moderationLog.create({
					data: {
						action: "CREATE_TOURNAMENT",
						actorId: userId,
						targetBattleId: newBattle.id,
					},
				});
				return newBattle;
			});
			return battle;
		}
		catch (error)
		{
			console.log("Error editing post:", error);
			throw new InternalServerErrorException("Could not edit post");
		}
	}
	async getCurrentTournament() {
		// donne moi le premier battle qui correspond a mes conditions
		const	now = new Date();
		const	battle = await this.prisma.battle.findFirst({
			// on cherche un tournoi dont la date de fin est dans le futur
			// nous permet de ne pas recuperer un ancien tournoi
			// gte: greater then or equal, lte: later or equal
			where: {
				startsAt: { lte: new Date() },
				endsAt: { gte: new Date() },
			},
			orderBy: {
				// desc = decroissant, tri les resultats par date de creation
				createdAt: 'desc',
			},
		});
		if (!battle)
				return null;
		if (battle.status === "UPCOMING" && now >= battle.startsAt)
		{
			await this.prisma.battle.update({
				where: { id: battle.id },
				data: {status: "ACTIVE"},
			});
		}
		return battle;
	}
	async joinTournament(battleId: number, userId: number, postData: JoinTournamentDto, imageUrl: string) {
		// await nous permet de recuperer les donnes pour les verifier plus bas
		// si on assigne le resultat a une variable on DOIT utiliser await
		// pas besoin de await seulement si on utilise return
		const battle = await this.prisma.battle.findUnique({
			where: { id: battleId },
		});
		if (!battle)
			// erreur 404 ressource non trouvee
			throw new NotFoundException ("Tournament doesn't exist");
		const now = new Date();
		if (now < battle.startsAt || now > battle.endsAt)
			// 400 requete invalide
			throw new BadRequestException("Tournament is not active")
		const userAlreadyExistant = await this.prisma.battleParticipant.findUnique({
			// battleId_userId > cle composite (@@ dans le schema prisma qui nous assure qu'on ne peut pas avoir deux fois le même couple (battleId, userId) dans la table)
			where: { battleId_userId: {
				// battle qu'on verifie
				battleId: battleId,
				//user qu'on verifie
				userId: userId, 
				},
			},
		});
		if (userAlreadyExistant)
			throw new BadRequestException("This user is already registered for this tournament");
		try {
			const post = await this.prisma.post.create({
				data: {
					authorId: userId,
					imageUrl: imageUrl,
					title: postData.title,
					caption: postData.caption,
				},
			});
			const participant = await this.prisma.battleParticipant.create({
				data: {
					battleId,
					userId,
					postId: post.id,
					submittedAt: new Date(),
				},
			});
			return participant;
		}
		catch (error)
		{
			console.log("Error creating post:", error);
			throw new InternalServerErrorException("Could not create post");
		}
	}
	async getParticipants(battleId: number)
	{
		// findMany > affiche tous les resultats
		return this.prisma.battleParticipant.findMany({
			// filtre par battle, cible une battle en particulier
			where : { battleId },
			include : {
				user:true,
				post: true,
			}
		});
	}
	async getBattlePosts(battleId: number) {
		return this.prisma.post.findMany({
			where: {
				battleParticipants: {
					some: {
						battleId: battleId,
					},
				},
			},
			include: {
				author: true,
				Like: true,
				battleParticipants: {
					include: { Battle: true },
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}
	async computeTournamentWinner(battleId: number)
	{
		const battle = await this.prisma.battle.findUnique({
			where : { id: battleId },
		});
		if (!battle)
			throw new NotFoundException ("Tournament doesn't exist");
		if (new Date() < battle.endsAt)
			throw new BadRequestException("Battle is not finished yet");
		if (battle.winnerId)
			return battle.winnerId;
		const winningPost = await this.prisma.post.findFirst({
			where: {
				battleParticipants: { 
					some: { battleId } 
				},
			},
			orderBy: {
				Like: {
					_count: "desc"
				}
			},
			include: {
				author: true,
				_count: {
					select: { Like: true }
				}
			}
		});	
		if (!winningPost)
			throw new NotFoundException ("No one participated in that tournament");
		await this.prisma.battle.update({
			where: {id: battleId },
			data: {
				status: "FINISHED",
				winnerId: winningPost.authorId,
			}
		});
		return winningPost;
	}

	async getLastTournamentWinnerPost() {
		const now = new Date();
		
		// D'abord, vérifier s'il y a un tournoi terminé (date passée) mais pas encore marqué FINISHED
		const justFinishedBattle = await this.prisma.battle.findFirst({
			where: {
				endsAt: { lt: now },
				status: { not: "FINISHED" }
			},
			orderBy: { endsAt: "desc" },
		});
		
		// Si on trouve un tournoi qui vient de finir, calculer son gagnant
		if (justFinishedBattle) {
			try {
				await this.computeTournamentWinner(justFinishedBattle.id);
			} catch (error) {
				console.log("Could not compute winner:", error);
			}
		}
		
		// Maintenant récupérer le dernier tournoi FINISHED avec un gagnant
		const battle = await this.prisma.battle.findFirst({
			where: { 
				status: "FINISHED",
				winnerId: { not: null }
			},
			orderBy: { endsAt: "desc"},
		});
		
		if (!battle || !battle.winnerId)
			return null;
		
		// Récupérer le post gagnant
		const lastWinnerPost = await this.prisma.post.findFirst({
			where: {
				authorId: battle.winnerId,
				battleParticipants: {
					some: { battleId: battle.id },
				},
			},
			include: {
				author: true,
				Like: true,
			},
		});
		
		return lastWinnerPost;
	}

	async getUserTournamentPosts(userId: number)
	{
		return this.prisma.post.findMany({
			where: {
				authorId: userId,
				battleParticipants: { some: {} },
			},
			include: 
			{
				author: true,
				Like: true,
				battleParticipants: {
					include: { Battle: true },
				}
			},
			orderBy: { createdAt: "desc" },
		});
	}
}
