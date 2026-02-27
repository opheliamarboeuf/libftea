import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User, Post, Like } from '@prisma/client';

@Injectable()
export class LikesService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async toggleLike(
		postId: number,
		userId: number,
	) {
		const post = await this.prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			throw new NotFoundException('Post not found');
		}

		const existing = await this.prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});

		if (existing) {
			await this.prisma.like.delete({
				where: {
					userId_postId: { userId, postId },
				},
			});
			return { liked: false };
		} else {
			await this.prisma.like.create({
				data: {
					userId,
					postId,
				},
			}); return { liked: true };
		}
	}

	async countLikes(
		postId: number,
	) {
		const count = await this.prisma.like.count({
			where: { postId },
		});
		return (count);
	}
}