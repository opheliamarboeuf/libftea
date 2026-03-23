import {
	Injectable,
	BadRequestException,
	ForbiddenException,
	NotFoundException,
	InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FriendsService {
		constructor(
		private readonly prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
	) {}

	private async hasReportRelationBetweenUsers(
		userId: number,
		targetId: number,
	): Promise<boolean> {
		const reportRelation = await this.prisma.report.findFirst({
			where: {
				OR: [
					{ reporterId: userId, reportedUserId: targetId },
					{ reporterId: targetId, reportedUserId: userId },
				],
			},
			select: { id: true },
		});

		return Boolean(reportRelation);
	}

	async sendFriendRequest(requesterId: number, addresseId: number) {

		const user = await this.prisma.user.findUnique({ where: {id: requesterId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot send a friend request');
		
		if (requesterId === addresseId) {
			throw new BadRequestException('You cannot add yourself as a friend');
		}

		const friend = await this.prisma.user.findUnique({
			where: { id: addresseId },
		});

		if (!friend) {
			throw new NotFoundException('User not found');
		}

		const hasReportRelation = await this.hasReportRelationBetweenUsers(requesterId, addresseId);
		if (hasReportRelation) {
			throw new BadRequestException('Friend request is not allowed between reported users');
		}

		const exists = await this.prisma.friendship.findFirst({
			where: {
				OR: [
					{ requesterId, addresseId },
					{ requesterId: addresseId, addresseId: requesterId },
				],
				NOT: { status: 'BLOCKED' },
			},
		});

		if (exists) {
			throw new BadRequestException('You have already sent a friend request to this user');
		}

		const created = await this.prisma.friendship.create({
			data: {
				requesterId,
				addresseId,
			},
		});
		
		await this.notificationsService.notifyFriendRequest(
			addresseId,
			user.username,
		);

		return created;
	}

	async acceptFriendRequest(requesterId: number, addresseId: number) {

		const user = await this.prisma.user.findUnique({ where: {id: addresseId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot accept a friend request');

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

		const hasReportRelation = await this.hasReportRelationBetweenUsers(requesterId, addresseId);
		if (hasReportRelation) {
			throw new BadRequestException(
				'Friend request cannot be accepted due to report relation',
			);
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
		const addresse = await this.prisma.user.findUnique({
			where: { id: addresseId },
		});
		if (addresse) {
			await this.notificationsService.notifyFriendRequestAccepted(
				requesterId,
				addresse.username,
			);
		}

		return updatedFriendship;
	}

	async rejectFriendRequest(requesterId: number, addresseId: number): Promise<void> {

		const user = await this.prisma.user.findUnique({ where: {id: addresseId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot reject a friend request');
		
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

		const user = await this.prisma.user.findUnique({ where: {id: userId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot access to friends list');

		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [{ requesterId: userId }, { addresseId: userId }],
			},
			include: {
				requester: {
					select: {
						id: true,
						username: true,
						bannedAt: true,
						profile: {
							select: {
								avatarUrl: true,
							},
						},
					},
				},
				addresse: {
					select: {
						id: true,
						username: true,
						bannedAt: true,
						profile: {
							select: {
								avatarUrl: true,
							},
						},
					},
				},
			},
		});

		const friends = friendships.map((friendship) => {
			const friend =
				friendship.requesterId === userId ? friendship.addresse : friendship.requester;
			return {
				id: friend.id,
				username: friend.username,
				bannedAt: friend.bannedAt,
				avatarUrl: friend.profile?.avatarUrl || null,
			};
		});

		// Filter out friends with report relations
		const filteredFriends = [];
		for (const friend of friends) {
			const hasReport = await this.hasReportRelationBetweenUsers(userId, friend.id);
			if (!hasReport) {
				filteredFriends.push(friend);
			}
		}

		return filteredFriends;
	}

	async getPendingRequests(userId: number) {

		const user = await this.prisma.user.findUnique({ where: {id: userId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot access to pending friend request');

		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'PENDING',
				addresseId: userId,
			},
			include: {
				requester: true,
			},
		});

		const requesters = friendships.map((f) => f.requester);

		// Filter out requesters with report relations
		const filteredRequesters = [];
		for (const requester of requesters) {
			const hasReport = await this.hasReportRelationBetweenUsers(userId, requester.id);
			if (!hasReport) {
				filteredRequesters.push(requester);
			}
		}

		return filteredRequesters;
	}

	async removeFriend(userId: number, friendId: number): Promise<void> {

		const user = await this.prisma.user.findUnique({ where: {id: userId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot remove a friendship');

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
		}

	async cancelRequest(requesterId: number, addresseId: number): Promise<void> {

		const user = await this.prisma.user.findUnique({ where: {id: requesterId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot cancel a friend request');

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
		} 

	async blockFriend(userId: number, targetId: number): Promise<void> {
		try {
			const user = await this.prisma.user.findUnique({ where: {id: userId}});
			if (!user) {
				throw new NotFoundException('User not found');
			}
			if (user.bannedAt)
				throw new ForbiddenException('Banned users cannot block a friend');
			
			if (userId === targetId) throw new BadRequestException('Cannot block yourself');

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

		const user = await this.prisma.user.findUnique({ where: {id: userId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot unblock a friend');

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
	}

	async getBlockedUsers(userId: number) {

		const user = await this.prisma.user.findUnique({ where: {id: userId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot get blocked suers list');

		const blocked = await this.prisma.friendship.findMany({
			where: {
				requesterId: userId,
				status: 'BLOCKED',
			},
			include: {
				addresse: true,
			},
		});

		return blocked.map((b) => b.addresse);
	}
}
