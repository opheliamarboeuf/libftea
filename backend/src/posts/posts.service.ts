import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, HttpException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PostsDto } from "./dto/create.dto";
import { UpdatePostDto } from "./dto/update.dto";
import { join } from "path";
import { unlink } from "fs/promises";
import { hasPermission } from "src/auth/permissions";
import { Role } from "@prisma/client";
import { ReportPostDto } from "./dto/report.dto";

@Injectable()
export class PostsService {
	constructor(
		private prisma: PrismaService,
	) {}

	private async getBlockedIds(currentUserId: number): Promise<number[]> {
		const  blocked = await this.prisma.friendship.findMany({
			where: {
				status: 'BLOCKED',
				OR: [
					{ requesterId: currentUserId },
					{ addresseId: currentUserId },
				],
			},
		});

		return blocked.map(f =>
		f.requesterId === currentUserId ? f.addresseId : f.requesterId
	); 
	}

	private async getReporterIdsForUser(userId: number): Promise<number[]> {
		const reports = await this.prisma.report.findMany({
			where: {
				reportedUserId: userId,
			},
			select: {
				reporterId: true,
			},
		});

		return reports.map((report) => report.reporterId);
	}

	async create(userId:number, dto: PostsDto) {
		try {
			const post = await this.prisma.post.create({
				data: {
					authorId: userId,
					imageUrl: dto.imageUrl,
					title: dto.title,
					caption: dto.caption,
				}
			})
			return (post);

		}
		catch (error)
		{
			console.log("Error creating post:", error);
			throw new InternalServerErrorException("Could not create post");
		}
	}

	async editPost(postId:number, dto: UpdatePostDto) {
		try { 
			const dataToUpdate: any = {};
			if (dto.title !== undefined)
				dataToUpdate.title = dto.title;
			if (dto.caption !== undefined)
					dataToUpdate.caption = dto.caption;

			const updatedPost = await this.prisma.post.update({
				where: { id: postId },
				data: dataToUpdate,
			});
			return (updatedPost);
		}
		catch (error) {
			console.log("Error editing post:", error);
			throw new InternalServerErrorException("Could not edit post");
		}
	}

	async deletePost(userId: number, userRole: Role, postId: number) {
		const post = await this.prisma.post.findUnique({ where: { id: postId } });
		if (!post)
			throw new NotFoundException("Post not found");

		// Check if the user is the post author or has the permission to delete the post
		if (userId !== post.authorId && !hasPermission(userRole, "DELETE_ANY_POST")) {
			throw new BadRequestException("You do not have the right to delete this post");
		}

		try {
			// A transaction ensures that multiple database operations either all succeed together or all fail, keeping data consistent
			await this.prisma.$transaction(async (prisma) => {
				// Log the post deletion if the user is not the author (MUST be done before deletion)
				if (userId !== post.authorId) {
					await prisma.moderationLog.create({
						data: {
							action: "DELETE_ANY_POST",
							actorId: userId,
							targetUserId: post.authorId,
							targetPostId: postId,
						},
					});
				}

				// Delete the post after logging
				await prisma.post.delete({ where: { id: postId } });
			});
				// Delete the image
			if (post.imageUrl) {
				await this.deletePostImage(post.imageUrl);
			}
			return true;
		} catch (error) {
			console.log("Error deleting post:", error);
			throw new InternalServerErrorException("Could not delete post");
		}
	}


	async deletePostImage(imageUrl: string): Promise<void> {
		if (!imageUrl)
			return;

		// Normalise path (removes the / if there is one)
		const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
		// Build absolute path
		const filePath = join(process.cwd(), relativePath);
		try {
			// Delete the file
			await unlink(filePath);
		} catch (error: any) {
			console.log("Could not delete post image:", error.message);
		}
	}

	async getPostById(id: number){
		const post = await this.prisma.post.findUnique({
			where: { id },
		})
		return post;
	}
	
	async getUserPosts(id: number, currentUserId?: number) {
		// If currentUserId is provided, check if viewing user is blocked
		if (currentUserId !== undefined) {
			const hasReportedCurrentUser = await this.prisma.report.findFirst({
				where: {
					reporterId: id,
					reportedUserId: currentUserId,
				},
				select: { id: true },
			});

			if (hasReportedCurrentUser) {
				return [];
			}

			const isBlocked = await this.prisma.friendship.findFirst({
				where: {
					status: 'BLOCKED',
					OR: [
						{ requesterId: id, addresseId: currentUserId },
						{ requesterId: currentUserId, addresseId: id },
					],
				},
			});

			if (isBlocked) {
				return [];
			}
		}

		const userPosts = await this.prisma.post.findMany({
			where: { 
				authorId: id,
				...(currentUserId !== undefined && {
					hiddenForUsers: {
						none: { userId: currentUserId }
					}
				})
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
	}

	async getFriendsPosts(userId: number) {
		const blockedIds = await this.getBlockedIds(userId);
		const reporterIds = await this.getReporterIdsForUser(userId);
		
		//  Get all friendships where the status is ACCEPTED
		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ requesterId: userId }, // user sent the friend request
					{ addresseId: userId }, // user received the friend request
				]
			},
			select: {
				requesterId: true, 
				addresseId: true
			}
		});
		
		// Convert friendships to a list of friend IDs
  		// If the user is the requester, the friend is the addressee, and vice versa
		const friendIds = friendships
		.map(f => f.requesterId === userId ? f.addresseId : f.requesterId)
		.filter(id => !blockedIds.includes(id) && !reporterIds.includes(id));
		
		if (friendIds.length === 0)
			return [];

		// Fetch posts authored by these friends
		return this.prisma.post.findMany({
			where: { 
				authorId: { in: friendIds },
			hiddenForUsers: {
					none: { userId: userId }
				}
			},
			orderBy: { createdAt: 'desc' },
			include: { author: true },
 	 });
	}
	async reportPost(postId: number, dto: ReportPostDto, currentUserId: number) {
		try {
			const reportedPost = await this.prisma.post.findUnique({
				where: { id: postId },
				select: { authorId: true },
			});
			if (!reportedPost)
				throw new NotFoundException("Post not found");
			if (reportedPost.authorId === currentUserId)
				throw new BadRequestException("You cannot report your own post");
			const existingReport = await this.prisma.report.findUnique({
				where: {
					reporterId_reportedPostId: {
					reporterId: currentUserId,
					reportedPostId: postId,
				},
			},
		});
		if (existingReport)
			throw new BadRequestException("You have already reported this post");

		const report = await this.prisma.$transaction(async (tx) => {
			const createdReport = await tx.report.create({
				data: {
					reporterId: currentUserId,
					reportedPostId: postId,
					reportCategory: dto.category,
					reportDescription: dto.description,
				},
			});

			await tx.postHiddenForUser.upsert({
				where: {
					postId_userId: {
						postId,
						userId: currentUserId,
					},
				},
				update: {},
				create: {
					postId,
					userId: currentUserId,
				},
			});

			// Remove any existing friendship with the post author (in both directions)
			const existingFriendship = await tx.friendship.findFirst({
				where: {
					OR: [
						{ requesterId: currentUserId, addresseId: reportedPost.authorId },
						{ requesterId: reportedPost.authorId, addresseId: currentUserId },
					],
				},
			});

			if (existingFriendship) {
				await tx.friendship.delete({
					where: { id: existingFriendship.id },
				});
			}

			return createdReport;
		});
		return report;
	} catch (error) {
		if (error instanceof HttpException)
			throw error;
		console.log("Error reporting post:", error);
		throw new InternalServerErrorException("Could not report post");
	}
}
}
