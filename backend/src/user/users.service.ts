import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async getBlockedIds(currentUserId: number): Promise<number[]> { 
		const blocked = await this.prisma.friendship.findMany({
			where: {
				status: 'BLOCKED',
				OR: [
					{ requesterId: currentUserId },
					{ addresseId: currentUserId },
				],
			},
			select: {
				requesterId: true,
				addresseId: true,
			}
		});
	
		const blockedIds = blocked.map(f => 
			f.requesterId === currentUserId ? f.addresseId : f.requesterId
		);
		 return blockedIds;
	}
	
	async searchUsername(username: string, currentUserId: number) {
	
		const blockedIds = await this.getBlockedIds(currentUserId);
		return this.prisma.user.findMany({
			where: {
				username: {
					contains: username,
					mode: 'insensitive',
				},
				NOT: {
					id: {in: blockedIds },
				}
			},
			select: {
				id: true,
				username: true,
				profile: {
					select: {
						avatarUrl: true,
						bio: true,
						coverUrl: true,
						displayName: true,
					},
				},
			},
			take: 10,
		});
	}

	async findId(id: number, currentUserId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				username: true,
				profile: {
					select: {
						avatarUrl: true,
						coverUrl: true,
						bio: true,
						displayName: true,
					}
				}
			},
		});

		if (!user) return null;

		// Check the block status
		const blocked = await this.prisma.friendship.findFirst({
		where: {
			status: 'BLOCKED',
			OR: [
				{ requesterId: currentUserId, addresseId: id },
				{ requesterId: id, addresseId: currentUserId },
			],
		},
	});

	if (blocked && blocked.addresseId === currentUserId) {
		// If blocked, return exception 403
		throw new ForbiddenException("You cannot access this profile");
	}

		// Count friends (accepted friendships)
		const friendsCount = await this.prisma.friendship.count({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ requesterId: id },
					{ addresseId: id },
				],
			},
		});

		// Check friendship status with current user
		const friendship = await this.prisma.friendship.findFirst({
			where: {
				OR: [
					{ requesterId: currentUserId, addresseId: id },
					{ requesterId: id, addresseId: currentUserId },
				],
			},
		});

		let friendshipStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED' = 'NONE';
		if (friendship) {
			if (friendship.status === 'ACCEPTED') {
				friendshipStatus = 'ACCEPTED';
			} else if (friendship.status === 'BLOCKED') {
				friendshipStatus = 'BLOCKED';
			} else if (friendship.status === 'PENDING') {
				friendshipStatus = friendship.requesterId === currentUserId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
			}
		}

		return {
			...user,
			friendsCount,
			friendshipStatus,
		};
	}

	async getAllUserPosts(currentUserId: number) {
		const blockedIds = await this.getBlockedIds(currentUserId);
		const userPosts = await this.prisma.post.findMany({
			where: { authorId: { notIn: blockedIds } },
			select: {
				id: true,
				authorId: true,
				title: true, 
				caption: true,
				imageUrl: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: {
						id: true, 
						username: true,
					}
				}
			},
			orderBy: {createdAt: 'desc'}
		})
		return (userPosts)
	};
}