import { Controller, Post, Body, Get, Req, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
	constructor(private readonly likesService: LikesService) {}

	@Post(':postId/like')
	async toggleLike(@Param('postId') postId: string, @Req() req: any) {
		const userId = req.user.id;
		return this.likesService.toggleLike(Number(postId), userId);
	}

	@Get(':postId/count')
	async countLikes(@Param('postId', ParseIntPipe) postId: number) {
		return this.likesService.countLikes(postId);
	}

	@Get(':postId/status')
	async isLiked(@Param('postId', ParseIntPipe) postId: number, @Req() req: any) {
		return this.likesService.isLiked(postId, req.user.id);
	}
}
