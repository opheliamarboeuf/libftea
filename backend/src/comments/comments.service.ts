import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User, Post, Comment } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
	    constructor (
        private readonly prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
    ) {}

	async createComment(postId: number, userId: number, content: string) {
		try{
			const user = await this.prisma.user.findUnique({ where: {id: userId}});
			if (!user) {
				throw new NotFoundException('User not found');
			}
			if (user.bannedAt)
				throw new ForbiddenException('Banned users cannot create comments'); 
	
			const post = await this.prisma.post.findUnique({
				where: { id: postId, deletedAt: null },
			});
	
			if (!post) {
				throw new NotFoundException('Post not found');
			}
	
			const comment = await this.prisma.comment.create({
				data: {
					content,
					userId,
					postId,
				},
				include: {
					user: true,
					replies: true,
				}
			});
			
			//notification
			const commenter = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			if (userId !== post.authorId) {
				await this.notificationsService.notifyPostCommented(post.authorId, commenter.username);
			}
			
			return comment;
		} catch (err) {
			if (
				err instanceof NotFoundException ||
				err instanceof ForbiddenException
			) {
				throw err;
			}

			console.log("Error creating comment:", err);
			throw new InternalServerErrorException("Could not create comment");
		}
	}

	async deleteComment(commentId: number, userId: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: {id: userId}});
			if (!user) {
				throw new NotFoundException('User not found');
			}
			if (user.bannedAt)
				throw new ForbiddenException('Banned users cannot delete comments'); 
	
			const comment = await this.prisma.comment.findUnique({
				where: { id: commentId, deletedAt: null },
				include: { replies: true },
			});

			if (!comment || comment.deletedAt) {
				throw new NotFoundException('Comment not found');
			}
	
			if (comment.userId !== userId) {
				throw new ForbiddenException('You cannot delete this comment');
			}
	
			// soft delete replies
			if (comment.replies && comment.replies.length > 0) {
				await this.prisma.comment.updateMany({
					where: { parentId: commentId },
					data: { deletedAt: new Date() },
				});
			}
	
			// soft delete comment
			await this.prisma.comment.update({
				where: { id: commentId },
				data: { deletedAt: new Date() },
			});
	
			return { success: true, deletedId: commentId };
		}
		catch (err) {
			if (
				err instanceof NotFoundException ||
				err instanceof ForbiddenException
			) {
				throw err;
			}

			console.log("Error deleting:", err);
			throw new InternalServerErrorException("Could not delete comment");
		}
	}
	
async replyComment(parentCommentId: number, userId: number, content: string) {
	try {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.bannedAt) {
			throw new ForbiddenException('Banned users cannot reply comments');
		}

		const parentComment = await this.prisma.comment.findUnique({
			where: { id: parentCommentId, deletedAt: null },
		});

		if (!parentComment) {
			throw new NotFoundException('Comment not found');
		}

		if (parentComment.parentId !== null) {
			throw new BadRequestException('Cannot reply to a reply');
		}

		const post = await this.prisma.post.findUnique({
			where: { id: parentComment.postId, deletedAt: null },
		});

		if (!post) {
			throw new NotFoundException('Post not found');
		}

		const reply = await this.prisma.comment.create({
			data: {
				content,
				userId,
				postId: parentComment.postId,
				parentId: parentCommentId,
			},
			include: {
				user: true,
				replies: true,
			},
		});

		// notification
		if (userId !== parentComment.userId) {
			await this.notificationsService.notifyCommentReplied(
				parentComment.userId,
				user.username,
			);
		}

		if (userId !== post.authorId) {
			await this.notificationsService.notifyPostCommented(
				post.authorId,
				user.username,
			);
		}

		return reply;
	} catch (err) {
		if (
			err instanceof NotFoundException ||
			err instanceof ForbiddenException ||
			err instanceof BadRequestException
		) {
			throw err;
		}

		console.error('Error replying to comment:', err);
		throw new InternalServerErrorException('Could not reply to comment');
	}
}

	async getComments(postId: number, currentUserId: number) {

		const user = await this.prisma.user.findUnique({ where: {id: currentUserId}});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.bannedAt)
			throw new ForbiddenException('Banned users cannot get comments');
		 
		const comments = await this.prisma.comment.findMany({
			where: {
				postId,
				parentId: null,
				deletedAt: null,
				NOT: {
					OR: [
						{
							user: {
								friendRequestSent: {
									some: {
										addresseId: currentUserId,
										status: 'BLOCKED',
									},
								},
							},
						},
						{
							user: {
								friendRequestReceived: {
									some: {
										requesterId: currentUserId,
										status: 'BLOCKED',
									},
								},
							},
						},
					],
				},
			},
			include: {
				user: true,
				replies: {
					where: {
						deletedAt: null,
						NOT: {
							OR: [
								{
									user: {
										friendRequestSent: {
											some: {
												addresseId: currentUserId,
												status: 'BLOCKED',
											},
										},
									},
								},
								{
									user: {
										friendRequestReceived: {
											some: {
												requesterId: currentUserId,
												status: 'BLOCKED',
											},
										},
									},
								},
							],
						},
					},
					include: { user: true },
				},
			},
			orderBy: { createdAt: 'asc' },
		});
		return comments;
	}
}
