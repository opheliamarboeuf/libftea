import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PostsDto } from "./dto/create.dto";
import { UpdatePostDto } from "./dto/update.dto";
import { join } from "path";
import { unlink } from "fs/promises";
import { hasPermission } from "src/auth/permissions";
import { Role } from "@prisma/client";

@Injectable()
export class PostsService {
	constructor(
		private prisma: PrismaService,
	) {}
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

	async deletePost(userId: number, userRole: Role, postId:number) {
		const post = await this.prisma.post.findUnique({
			where: {id: postId}
		});

		if (!post)
			return ;

		// Check if the user is the author
		if (userId !== post.authorId)
		{
			if (!hasPermission(userRole, "DELETE_ANY_POST"))
				throw new  BadRequestException("You do not have the right to delete this post");
		}
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
	
	async getUserPosts(id: number) {
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
		const friendIds = friendships.map(f => 
			f.requesterId === userId ? f.addresseId : f.requesterId
		);
		
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
