import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async searchUsername(username: string) {
		return this.prisma.user.findMany({
			where: {
				username: {
					contains: username,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				username: true,
				profile: {
					select: {
						avatarUrl: true,
						bio: true,
						coverUrl: true,
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
					}
				}
			},
		});

		if (!user) return null;

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
			friendshipStatus,
		};
	}
}