import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JoinTournamentDto } from './dto/join-tournament.dto';

@Injectable()
export class TournamentService {
	constructor(private readonly prisma: PrismaService) {}
	// async = attend une reponse lente
	async createTournament(data: CreateTournamentDto){
		return this.prisma.battle.create({
			data: {
				theme: data.theme,
				startsAt: new Date(data.startDate),
				endsAt: new Date(data.endDate),
			},
		});
	}
	async getCurrentTournament() {
		// donne moi le premier battle qui correspond a mes conditions
		return this.prisma.battle.findFirst({
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
}
