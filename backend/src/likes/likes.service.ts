import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
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
			include: {
				battleParticipants:
				{
					include: {
						Battle: true,
					},
				},
			},
		});
		try {
			const post = await this.prisma.post.findUnique({
				where: { id: postId },
				include: { author: true },
			});

		if (!post) {
			throw new NotFoundException('Post not found');
		}
		// si le post fait parti d'un tournoi 
		if (post.battleParticipants.length > 0)
		{
			const battle = post.battleParticipants[0].Battle;
			const now = new Date();
			if (now < battle.startsAt || now > battle.endsAt)
				throw new BadRequestException("Voting is closed for this tournament");
			if (post.authorId === userId)
				throw new ForbiddenException("You can't vote for your own post");
		}
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
				
				if (userId !== post.authorId) {
					await this.notificationsService.notifyPostLiked(post.authorId, liker.username);
				}

				const count = await this.prisma.like.count({ where: { postId }});
				return { liked: true, count };
			}
		} catch (err) {
			console.log("Error like/unliking post:", err);
			throw new InternalServerErrorException("Could not like/unlike post");
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