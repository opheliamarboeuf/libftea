import { Injectable, ForbiddenException, NotFoundException, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common'
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
	
	async getHiddenUserIds(userId: number) {
		const hiddenUsers = await this.prisma.userHiddenForUser.findMany({
			where: {
			userId: userId
			},
			select: {
			targetUserId: true
			}
		})
		return hiddenUsers.map(u => u.targetUserId)
	}

	async getReportedUserIds (userId: number) {
		const reportedUsers = await this.prisma.report.findMany({
			where: {
				reporterId: userId,
				reportedUserId: { not: null } // only the users, not the posts
			},
			select: {reportedUserId: true}
		});
		return reportedUsers.map(r => r.reportedUserId!)
	}

	async getReporterIdsForUser(userId: number) {
		const reporters = await this.prisma.report.findMany({
			where: {
				reportedUserId: userId,
			},
			select: { reporterId: true }
		});
		return reporters.map(r => r.reporterId)
	}

	async searchUsername(username: string, currentUserId: number) {
	
		const blockedIds = await this.getBlockedIds(currentUserId);
		const hiddenUserIds = await this.getHiddenUserIds(currentUserId);
		const reportedUserIds = await this.getReportedUserIds(currentUserId);
		const reporterIds = await this.getReporterIdsForUser(currentUserId);
		const excludedIds = [...blockedIds, ...hiddenUserIds, ...reportedUserIds, ...reporterIds];
		
		return this.prisma.user.findMany({
			where: {
				username: {
					contains: username,
					mode: 'insensitive',
				},
				NOT: {
					id: {in: excludedIds},
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
				bannedAt: true,
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

		if (user.bannedAt)
			throw new ForbiddenException("You cannot access this profile");

		if (!user) return null;

		const hidden = await this.prisma.userHiddenForUser.findUnique({
			where: { targetUserId_userId: { userId: currentUserId, targetUserId: id}}
		})
		if (hidden)
		    throw new ForbiddenException("You cannot access this profile");

		const hasReportedYou = await this.prisma.report.findFirst({
			where: {
				reporterId: id,
				reportedUserId: currentUserId,
			},
			select: { id: true },
		});
		if (hasReportedYou)
			throw new ForbiddenException("You cannot access this profile");
  			
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
		const hiddenUserIds = await this.getHiddenUserIds(currentUserId);
		const reporterIds = await this.getReporterIdsForUser(currentUserId);
		
		const userPosts = await this.prisma.post.findMany({
			where: { 
				authorId: { notIn: [...blockedIds, ...hiddenUserIds, ...reporterIds] },
				deletedAt: null,
				hiddenForUsers: {
					none: { userId: currentUserId }
				}
			},
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
