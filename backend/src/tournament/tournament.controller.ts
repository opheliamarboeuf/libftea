import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	UseGuards,
	ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from '@prisma/client';
import { ImageResizeService } from '../common/service/image-resize.service';

@Controller('tournament')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TournamentController {
	constructor(
		private readonly tournamentService: TournamentService,
		private readonly imageResizeService: ImageResizeService,
	) {}

	@Roles('ADMIN')
	@Post()
	createTournament(@Body() data: CreateTournamentDto, @Req() req: any) {
		const userId = req.user.id;
		const userRole = req.user.role;
		return this.tournamentService.createTournament(data, userId, userRole);
	}
	@Get('current')
	getCurrentTournament() {
		return this.tournamentService.getCurrentTournament();
	}
	@Post(':battleId/join')
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: './uploads/tournament',
				filename: (req, file, cb) => {
					const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(null, uniqueSuffix + extname(file.originalname));
				},
			}),
		}),
	)
	async joinTournament(
		@Param('battleId') battleId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() data: JoinTournamentDto,
		@Req() req: any,
	) {
		if (!file) throw new BadRequestException('Image is required');
		// Resize the picture
		const resizedPath = await this.imageResizeService.resizePost(file.path);
		// Extract file name
		const filename = resizedPath.split('/').pop() || resizedPath.split('\\').pop(); // Handle Windows/Linux paths
		// Set the image URL
		const imageUrl = `/uploads/tournament/${filename}`;
		const userId = req.user.id;
		return this.tournamentService.joinTournament(Number(battleId), userId, data, imageUrl);
	}
	@Get('recent')
	async getRecentTournament() {
		try {
			const tournament = await this.tournamentService.getRecentTournament();
			return tournament || null;
		} catch (error) {
			return null;
		}
	}
	@Get(':battleId/participants')
	getParticipants(@Param('battleId') battleId: string) {
		return this.tournamentService.getParticipants(Number(battleId));
	}
	@Get('last-winner-post')
	async getLastTournamentWinner(@Req() req: any) {
		const userId = req.user.id;
		const post = await this.tournamentService.getLastTournamentWinnerPost(userId);
		return post ?? null;
	}
	@Get('user/:userId/posts')
	getUserTournamentPosts(@Param('userId', ParseIntPipe) userId: number) {
		return this.tournamentService.getUserTournamentPosts(userId);
	}
	@Get(':battleId/posts')
	async getBattlePosts(@Param('battleId') battleId: string, @Req() req: any) {
		const userId = req.user.id;
		try {
			await this.tournamentService.computeTournamentWinner(Number(battleId));
		} catch {
			// Tournament may not be finished yet — still return the posts
		}
		return this.tournamentService.getBattlePosts(Number(battleId), userId);
	}
}
