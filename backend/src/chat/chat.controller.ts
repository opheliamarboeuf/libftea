import { Controller, Get, Post, Param, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { Request } from 'express';
import path from 'path';

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

	@Patch('messages/:messageId/read')
	async markMessageAsRead(
		@Param('messageId') messageId: string,
	) {
		return this.chatService.markAsRead(Number(messageId));
	}
}
