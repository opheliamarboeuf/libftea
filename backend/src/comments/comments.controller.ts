import { Controller, Post, Body, Get, Req, Param, UseGuards, ParseIntPipe, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post('post/:postId')
	async createComment(
		@Param('postId', ParseIntPipe) postId: number,
        @Body('content') content: string, 
		@Req() req: any,
	) {
		const userId = req.user.id;
		return this.commentsService.createComment(postId, userId, content);
	}

    @Delete(':commentId')
    async deleteComment(
        @Param('commentId', ParseIntPipe) commentId: number,
		@Req() req: any,
    ) {
        const userId = req.user.id;
		return this.commentsService.deleteComment(commentId, userId);
    }

    @Post(':parentCommentId/reply')
    async replyComment(
        @Param('parentCommentId', ParseIntPipe) parentCommentId: number,
        @Body('content') content: string, 
		@Req() req: any,
    ) {
        const userId = req.user.id;
        return this.commentsService.replyComment(parentCommentId, userId, content);
    }

    @Get('post/:postId')
    async getComments(
        @Param('postId', ParseIntPipe) postId: number,
        @Req() req
    ) {
        return this.commentsService.getComments(postId, req.user.id);
    }
}