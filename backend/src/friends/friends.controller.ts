import { Controller, Post, Body, Get, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Post('request/:addresseId')
	async sendFriendRequest(@Req() req: Request & { user: { id: number } }, @Param('addresseId') addresseId: string) {
		const requesterId = req.user.id;
		return this.friendsService.sendFriendRequest(requesterId, Number(addresseId));
	}

	@Post('accept/:requesterId')
	async acceptFriendRequest(@Req() req: Request & { user: { id: number } }, @Param('requesterId') requesterId: string) {
		const addresseId = req.user.id;
		return this.friendsService.acceptFriendRequest(Number(requesterId), addresseId);
	}

	@Delete('reject/:requesterId')
	async rejectFriendRequest(@Req() req: Request & { user: { id: number } }, @Param('requesterId') requesterId: string) {
		const addresseId = req.user.id;
		return this.friendsService.rejectFriendRequest(Number(requesterId), addresseId);
	}

	@Get()
	async getFriends(@Req() req: Request & { user: { id: number } }) {
		const userId = req.user.id;
		return this.friendsService.getFriends(userId);
	}

	@Get('pending')
	async getPendingRequests(@Req() req: Request & { user: { id: number } }) {
		const userId = req.user.id;
		return this.friendsService.getPendingRequests(userId);
	}

	@Delete('remove/:friendId')
	async removeFriend(@Req() req: Request & { user: { id: number } }, @Param('friendId') friendId: string) {
		const userId = req.user.id;
		return this.friendsService.removeFriend(userId, Number(friendId));
	}

	@Delete('cancel/:addresseId')
	async cancelRequest(@Req() req: Request & { user: { id: number } }, @Param('addresseId') addresseId: string) {
		const requesterId = req.user.id;
		return this.friendsService.cancelRequest(requesterId, Number(addresseId));
	}

	@Delete('block/:targetId')
	async blockFriend(@Req() req: Request & { user: { id: number } }, @Param('targetId') targetId: string) {
		const userId = req.user.id;
		return this.friendsService.blockFriend(userId, Number(targetId));
	}

	@Delete('unblock/:targetId')
	async unBlockFriend(@Req() req: Request & { user: { id: number } }, @Param('targetId') targetId: string) {
		const userId = req.user.id;
		return this.friendsService.unBlockFriend(userId, Number(targetId));
	}

	@Get('blocked')
	async getBlockedUsers(@Req() req: Request & { user: { id: number } }) {
		const userId = req.user.id;
		return this.friendsService.getBlockedUsers(userId);
	}
}
