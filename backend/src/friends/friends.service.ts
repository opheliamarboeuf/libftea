import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Friendship, User } from '@prisma/client';

@Injectable()
export class FriendsService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async sendFriendRequest(
		requesterId: number,
		addresseId: number,
	): Promise<Friendship> {
		
		if (requesterId === addresseId) {
			throw new BadRequestException('You cannot add yourself as a friend');
		}
		
		const friend = await this.prisma.user.findUnique({
			where: { id: addresseId },
		});
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
		if (exists) {
			throw new BadRequestException('You have already sent a friend request to this user');
		}

		return this.prisma.friendship.create({
			data: {
				requesterId,
				addresseId,
			},
		});
	}

	async acceptFriendRequest(
		requesterId: number, 
		addresseId: number,
	): Promise<Friendship> {

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

		const updatedFriendship = await this.prisma.update({
			where: {
				requesterId_adresseId: {
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

		await this.prisma.friendship.delete({
			where: {
				requesterId_adresseId: {
					requesterId,
					addresseId,
				},
			},
		});
	}

	async getFriends(userId: number): Promise<User[]> {

		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ requesterId: userId},
					{ adresseId: userId},
				],
				},
			include: {
				requester: true,
				adresse: true,
			},
		});
		return friendships.map((friendship) => {
			return friendship.requesterId === userId
			 ? friendship.adresse
			 : friendship.requester;
		});
	}

	async getPendingRequests(userId: number): Promise<User[]> {

		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'PENDING',
				adresseId: userId,
				},
			include: {
				requester: true,
			},
		});
		return friendships.map(f => f.requester);
	}
}