import { Controller, Get, Post, Body } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Roles } from '../auth/roles.decorator'

@Controller('tournament')
export class TournamentController {
	// injection de dependances, indique a nestJS que l'on va utiliser TournamentService
	// on le stocke dans une variable privee tournamentService de type TournamentService
	// readonly pour ne pas la modifier, provate pour que la variable soit accessible seulement dans cette classe
	constructor(private readonly tournamentService: TournamentService) {}

	@Roles('ADMIN')
	@Post()
	// @Body() on prend le corps de la requete HTTP
	// data = nom de la variable, any = type TS 
	createTournament(@Body() data: CreateTournamentDto) {
		return this.tournamentService.createTournament(data);
	}
	@Get('current')
	getCurrentTournament() {
		return this. tournamentService.getCurrentTournament();
	}
}
