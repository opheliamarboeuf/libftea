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
			include: {
				battleParticipants:
				{
					include: {
						battle: true,
					},
				},
			},
		});

		if (!post) {
			throw new NotFoundException('Post not found');
		}
		// si le post fait parti d'un tournoi 
		if (post.battleParticipants.length > 0)
		{
			const battle = post.battleParticipants[0].battle;
			const now = new Date();
			if (now < battle.startsAt || now > battle.endsAt)
				throw new BadRequestException("Voting is closed for this tournament");
			if (post.authorId === userId)
				throw new ForbiddenException("You can't vote for your own post");
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