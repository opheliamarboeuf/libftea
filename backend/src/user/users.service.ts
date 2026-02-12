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

	async findId(id: number) {
		return this.prisma.user.findUnique({
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
	}
}