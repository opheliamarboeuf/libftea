import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PostsDto } from "./dto/create.dto";
import { UpdatePostDto } from "./dto/update.dto";
import { join } from "path";
import { unlink } from "fs/promises";
import { NotificationsService } from "src/notifications/notifications.service";

@Injectable()
export class PostsService {
	constructor(
		private prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
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

			//notification
			const poster = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			const friendships = await this.prisma.friendship.findMany({
				where: {
					status: 'ACCEPTED',
					OR: [
						{ requesterId: userId },
						{ addresseId: userId },
					],
				},
			});
			const friendIds = friendships.map(f =>
				f.requesterId === userId ? f.addresseId : f.requesterId
			);

			await Promise.all(
				friendIds.map(friendId =>
					this.notificationsService.notifyFriendPost(friendId, poster.username)
				)
			);
			
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

	async deletePost(postId:number) {
		try {
			await this.prisma.post.delete({
				where: { id: postId },
			})
			return true;
		}
		catch (error) {
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
			where: { authorId: id },
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
		.filter(id => !blockedIds.includes(id));
		
		if (friendIds.length === 0)
			return [];

		// Fetch posts authored by these friends
		return this.prisma.post.findMany({
			where: { authorId: { in: friendIds } },
			orderBy: { createdAt: 'desc' },
			include: { author: true },
 	 });
	}
}
