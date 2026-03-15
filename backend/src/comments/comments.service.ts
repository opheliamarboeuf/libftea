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

    async createComment(
		postId: number,
		userId: number,
        content: string,
	) {
		try {
			const post = await this.prisma.post.findUnique({
				where: { id: postId },
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
			console.log("Error creating comment:", err);
			throw new InternalServerErrorException("Could not create comment");
		}
        
    }

    async deleteComment(
		commentId: number,
		userId: number,
	) {
		try {
			const comment = await this.prisma.comment.findUnique({
				where: { id: commentId },
				include: { replies: true },
			});

			if (!comment) {
				throw new NotFoundException('Comment not found');
			}

			if (comment.userId !== userId) {
				throw new ForbiddenException('You cannot delete this comment');
			}

			if (comment.replies && comment.replies.length > 0) {
				await this.prisma.comment.deleteMany({
					where: { parentId: commentId },
				});
			}

			await this.prisma.comment.delete({
					where: { id: commentId },
			});
			
			return { success: true, deletedId: commentId };
		} catch (err) {
			console.log("Error deleting:", err);
			throw new InternalServerErrorException("Could not delete comment");
		}
        
    }

    async replyComment(
        parentCommentId: number,
		userId: number,
        content: string,
	) {
		try {
			const parentComment = await this.prisma.comment.findUnique({
				where: { id: parentCommentId },
			});

			if (!parentComment) {
				throw new NotFoundException('Comment not found');
			}

			if (parentComment.parentId !== null) {
				throw new BadRequestException('Cannot reply to a reply');
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

			//notification
			const commenter = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			const recipient = await this.prisma.user.findUnique({
				where: { id: parentComment.userId },
			});
			const post = await this.prisma.post.findUnique({
				where: { id: parentComment.postId },
			});
			if (userId !== parentComment.userId) {
				await this.notificationsService.notifyCommentReplied(recipient.id, commenter.username);
			}
			if (userId !== post.authorId) {
				await this.notificationsService.notifyPostCommented(post.authorId, commenter.username);
			}

			return reply;
		} catch (err) {
			console.log("Error replying to comment:", err);
			throw new InternalServerErrorException("Could not reply to comment");
		}
        
    }

    async getComments(postId: number, currentUserId: number) {
        const comments = await this.prisma.comment.findMany({
            where: {
                postId,
                parentId: null,
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
            orderBy: { createdAt: "asc" },
        });

        return comments;
    }
}