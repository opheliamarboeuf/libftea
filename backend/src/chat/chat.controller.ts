import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Get('conversations')
	async getMyConversations(@Req() req: Request) {
		const userId = req.user.id;
		return this.chatService.getUserconversations(userId);
	}

	@Get('conversations/:friendId')
	async getOrCreateConversation(
		@Req() req: Request,
		@Param('friendId') friendId: string,
	) {
		const userId = req.user.id;
		return this.chatService.getOrCreateConversation(userId, Number(friendId));
	}
}