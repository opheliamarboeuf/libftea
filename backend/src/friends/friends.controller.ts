import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Request } from 'express';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Post('request/:addresseId')
	async sendFriendRequest(@Req() req: Request, @Param('adresseId') adresseId: string) {
		const requesterId = req.user.id;
		return this.friendsService.sendFriendRequest(requesterId, Number(adresseId));
	}

	@Post('accept/:requesterId')
	async acceptFriendRequest(@Req() req)
}