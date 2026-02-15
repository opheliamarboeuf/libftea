import { Controller, Post, Body, Get, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Post('request/:addresseId')
	async sendFriendRequest(@Req() req: Request, @Param('addresseId') addresseId: string) {
		const requesterId = req.user.id;
		return this.friendsService.sendFriendRequest(requesterId, Number(addresseId));
	}

	@Post('accept/:requesterId')
	async acceptFriendRequest(@Req() req: Request, @Param('requesterId') requesterId: string) {
		const addresseId = req.user.id;
		return this.friendsService.acceptFriendRequest(Number(requesterId), addresseId);
	}

	@Delete('reject/:requesterId')
	async rejectFriendRequest(@Req() req: Request, @Param('requesterId') requesterId: string) {
		const addresseId = req.user.id;
		return this.friendsService.rejectFriendRequest(Number(requesterId), addresseId);
	}

	@Get()
	async getFriends(@Req() req: Request) {
		const userId = req.user.id;
		return this.friendsService.getFriends(userId);
	}

	@Get('pending')
	async getPendingRequests(@Req() req: Request) {
		const userId = req.user.id;
		return this.friendsService.getPendingRequests(userId);
	}

	@Delete('remove/:friendId')
	async removeFriend(@Req() req: Request, @Param('friendId') friendId: string) {
		const userId = req.user.id;
		return this.friendsService.removeFriend(userId, Number(friendId));
	}

	@Delete('cancel/:addresseId')
	async cancelRequest(@Req() req: Request, @Param('addresseId') addresseId: string) {
		const requesterId = req.user.id;
		return this.friendsService.cancelRequest(requesterId, Number(addresseId));
	}
}