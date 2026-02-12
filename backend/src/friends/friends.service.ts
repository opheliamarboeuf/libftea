import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User } from '@prisma/client';

@Injectable()
export class FriendsService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async sendFriendRequest(
		requesterId: number,
		addresseId: number,
	) {
		
		console.log('sendFriendRequest called:', { requesterId, addresseId });
		if (requesterId === addresseId) {
			throw new BadRequestException('You cannot add yourself as a friend');
		}
		
		const friend = await this.prisma.user.findUnique({
			where: { id: addresseId },
		});

		console.log('Friend found:', friend);

		if (!friend) {
			throw new NotFoundException('User not found');
		}

		const exists = await this.prisma.friendship.findFirst({
			where: {
				OR: [
					{ requesterId, addresseId },
					{ requesterId: addresseId, addresseId: requesterId },
				],
			},
		});

		console.log('Existing friendship:', exists);

		if (exists) {
			throw new BadRequestException('You have already sent a friend request to this user');
		}

		const created = this.prisma.friendship.create({
			data: {
				requesterId,
				addresseId,
			},
		});

		console.log('Friendship created:', created);

		return created;
	}

	async acceptFriendRequest(
		requesterId: number, 
		addresseId: number,
	) {

		const friendship = await this.prisma.friendship.findUnique({
			where: {
				requesterId_addresseId: {
					requesterId,
					addresseId,
				},
			},
		});

		if (!friendship) {
			throw new BadRequestException('Friendship request does not exist');
		}

		if (friendship.status !== 'PENDING') {
			throw new BadRequestException('Friendship request is not pending');
		}

		const updatedFriendship = await this.prisma.friendship.update({
			where: {
				requesterId_addresseId: {
					requesterId,
					addresseId,
				},
			},
			data: {
				status: 'ACCEPTED',
			},
		});
		
		return updatedFriendship;
	}

	async rejectFriendRequest(
		requesterId: number, 
		addresseId: number,
	): Promise<void> {

		const friendship = await this.prisma.friendship.findFirst({
			where: {
				requesterId,
				addresseId,
				status: 'PENDING',
			},
		});
		if (!friendship) {
			throw new BadRequestException('Friendship request does not exist');
		}

		if (friendship.status !== 'PENDING') {
			throw new BadRequestException('Friendship request is not pending');
		}

		await this.prisma.friendship.delete({
			where: {
				id: friendship.id,
			},
		});
	}

	async getFriends(userId: number) {

		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ requesterId: userId},
					{ addresseId: userId},
				],
				},
			include: {
				requester: true,
				addresse: true,
			},
		});
		return friendships.map((friendship) => {
			return friendship.requesterId === userId
			 ? friendship.addresse
			 : friendship.requester;
		});
	}

	async getPendingRequests(userId: number) {

		console.log('getPendingRequests called for userId:', userId);
		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'PENDING',
				addresseId: userId,
				},
			include: {
				requester: true,
			},
		});

		return friendships.map(f => f.requester);
	}
}