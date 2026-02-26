import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';

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
}
