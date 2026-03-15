import { Injectable, BadRequestException, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FriendsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
	) {}

	async sendFriendRequest(
		requesterId: number,
		addresseId: number,
	) {
		try {
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
					NOT: { status: 'BLOCKED'},
				},
			});

			console.log('Existing friendship:', exists);

			if (exists) {
				throw new BadRequestException('You have already sent a friend request to this user');
			}

			const created = await this.prisma.friendship.create({
				data: {
					requesterId,
					addresseId,
				},
			});

			//notification
			const sender = await this.prisma.user.findUnique({
				where: { id: requesterId },
			});
			await this.notificationsService.notifyFriendRequest(addresseId, sender.username);

			return created;
		} catch (err) {
			console.log("Error sending friend request:", err);
			throw new InternalServerErrorException("Could not send friend request");
		}
		
	}

	async acceptFriendRequest(
		requesterId: number, 
		addresseId: number,
	) {
		try {
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

			//notification
			const friend = await this.prisma.user.findUnique({
				where: { id: addresseId },
			});
			await this.notificationsService.notifyFriendRequestAccepted(requesterId, friend.username);
			
			return updatedFriendship;
		} catch (err) {
			console.log("Error accepting friend request:", err);
			throw new InternalServerErrorException("Could not accept friend request");
		}
		
	}

	async rejectFriendRequest(
		requesterId: number, 
		addresseId: number,
	): Promise<void> {
		try {
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
		} catch (err) {
			console.log("Error rejecting friend request:", err);
			throw new InternalServerErrorException("Could not reject friend request");
		}
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

	async removeFriend(userId: number, friendId: number): Promise<void> {
		try {
			const friendship = await this.prisma.friendship.findFirst({
				where: {
					status: 'ACCEPTED',
					OR: [
						{ requesterId: userId, addresseId: friendId },
						{ requesterId: friendId, addresseId: userId },
					],
				},
			});

			if (!friendship) {
				throw new BadRequestException('Friendship does not exist');
			}

			await this.prisma.friendship.delete({
				where: { id: friendship.id },
			});
		} catch (err) {
			console.log("Error removing friend:", err);
			throw new InternalServerErrorException("Could not remove friend");
		}
		
	}

	async cancelRequest(requesterId: number, addresseId: number): Promise<void> {
		try {
			const friendship = await this.prisma.friendship.findFirst({
				where: {
					requesterId,
					addresseId,
					status: 'PENDING',
				},
			});

			if (!friendship) {
				throw new BadRequestException('Friend request does not exist');
			}

			await this.prisma.friendship.delete({
				where: { id: friendship.id },
			});
		} catch (err) {
			console.log("Error cancelling friend request:", err);
			throw new InternalServerErrorException("Could not cancel friend request");
		}
		
	}

	async blockFriend(userId: number, targetId: number): Promise<void> {
		try {
			if (userId === targetId) throw new BadRequestException("Cannot block yourself");

			const existing = await this.prisma.friendship.findFirst({
				where: {
					OR: [
						{ requesterId: userId, addresseId: targetId },
						{ requesterId: targetId, addresseId: userId },
					],
				},
			});

			if (existing) {
				await this.prisma.friendship.update({
					where: { id: existing.id },
					data: { 
						status: 'BLOCKED',
						requesterId: userId,
						addresseId: targetId,
					},
				});
			} else {
				await this.prisma.friendship.create({
					data: { 
						requesterId: userId,
						addresseId: targetId,
						status: 'BLOCKED',
					},
				});
			}
		} catch (err) {
			console.log("Error blocking user:", err);
			throw new InternalServerErrorException("Could not block user");
		}
	}

	async unBlockFriend(userId: number, targetId: number): Promise<void> {
		try {
			const blocked = await this.prisma.friendship.findFirst({
				where: {
					status: 'BLOCKED',
					OR: [
						{ requesterId: userId, addresseId: targetId },
						{ requesterId: targetId, addresseId: userId },
					],
				},
			});

			if (!blocked) {
				throw new BadRequestException('No block relation found');
			}

			await this.prisma.friendship.delete({
				where: { id: blocked.id },
			});
		} catch (err) {
			console.log("Error unblocking user:", err);
			throw new InternalServerErrorException("Could not unblock user");
		}
		
	}

	async getBlockedUsers(userId: number) {
		const blocked = await this.prisma.friendship.findMany({
			where: {
				requesterId: userId,
				status: 'BLOCKED',
			},
			include: {
				addresse: true,
			},
		});

		return blocked.map(b => b.addresse);
	}
}