import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User, Post, Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
    constructor (
        private readonly prisma: PrismaService,
    ) {}

    async createComment(
		postId: number,
		userId: number,
        content: string,
	) {
        const post = await this.prisma.post.findUnique({
			where: { id: postId, deletedAt: null },
		});

		if (!post) {
			throw new NotFoundException('Post not found');
		}

        return this.prisma.comment.create({
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
    }

    async deleteComment(
		commentId: number,
		userId: number,
	) {
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
    }

    async replyComment(
        parentCommentId: number,
		userId: number,
        content: string,
	) {
        const parentComment = await this.prisma.comment.findUnique({
            where: { id: parentCommentId },
        });

        if (!parentComment) {
            throw new NotFoundException('Comment not found');
        }

        if (parentComment.parentId !== null) {
            throw new BadRequestException('Cannot reply to a reply');
        }

        return this.prisma.comment.create({
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