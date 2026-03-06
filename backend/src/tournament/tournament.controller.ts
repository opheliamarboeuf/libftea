import { Controller, Get, Post, Body, Param, Req, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JoinTournamentDto } from './dto/join-tournament.dto'
import { Roles } from '../auth/roles.decorator'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tournament')
@UseGuards(JwtAuthGuard)
export class TournamentController {
	// injection de dependances, indique a nestJS que l'on va utiliser TournamentService
	// on le stocke dans une variable privee tournamentService de type TournamentService
	// readonly pour ne pas la modifier, provate pour que la variable soit accessible seulement dans cette classe
	constructor(private readonly tournamentService: TournamentService) {}

	// @Roles('ADMIN')
	@Post()
	// @Body() on prend le corps de la requete HTTP
	// data = nom de la variable, any = type TS 
	createTournament(@Body() data: CreateTournamentDto)
	{
		return this.tournamentService.createTournament(data);
	}
	@Get('current')
	getCurrentTournament()
	{
		return this. tournamentService.getCurrentTournament();
	}
	@Post(':battleId/join')
	@UseInterceptors (
		FileInterceptor('image', {
			storage: diskStorage({
				destination: './uploads/tournament',
				filename: (req, file, cb) => {
					const uniqueSuffix =
					Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(null, uniqueSuffix + extname(file.originalname));
				},
			}),
		}),
	)
	// @Req car c'est JwtAuthGuard stock notre utilisateur dans req.user
	// sources de donnees dont le service a besoin
	joinTournament(
		@Param('battleId') battleId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() data: JoinTournamentDto,
		@Req() req: any)
	{
		if (!file)
				throw new BadRequestException('Image is required');
		// user.id > informations récolté par JWT
		const imageUrl = `/uploads/tournament/${file.filename}`;
		const userId = req.user.id;
		// Number(battleId) > conversion de battleId de string à int
		return this.tournamentService.joinTournament(Number(battleId), userId, data, imageUrl);
	}
	@Get(':battleId/participants')
	getParticipants(@Param('battleId') battleId: string)
	{
		return this.tournamentService.getParticipants(Number(battleId));
	}
	@Get(':battleId/posts')
	getBattlePosts(@Param('battleId') battleId: string) {
		return this.tournamentService.getBattlePosts(Number(battleId));
	}
}
