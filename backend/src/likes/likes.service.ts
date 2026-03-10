import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User, Post, Like } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class LikesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
	) {}

	async toggleLike(
		postId: number,
		userId: number,
	) {
		const post = await this.prisma.post.findUnique({
			where: { id: postId },
			include: { author: true },
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
			const count = await this.prisma.like.count({ where: { postId }});
			return { liked: false, count };
		} else {
			await this.prisma.like.create({
				data: {
					userId,
					postId,
				},
			});

			//notification
			const liker = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			await this.notificationsService.notifyPostLiked(post.authorId, liker.username);

			const count = await this.prisma.like.count({ where: { postId }});
			return { liked: true, count };
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

	async isLiked(
		postId: number,
		userId: number,
	) {
		const like = await this.prisma.like.findFirst({
			where: {
				postId,
				userId,
			},
		});

		return { liked: !!like };
	}
}