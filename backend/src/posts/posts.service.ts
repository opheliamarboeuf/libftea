import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PostsDto } from "./dto/create.dto";

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
					imageUrl: "default-image.jpeg", //A CHANGER
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
	async getUserPosts(userId: number) {
		try {
			const postsData = await this.prisma.post.findMany({
				where: {authorId: userId},
				orderBy: { createdAt: 'desc'}
			});
			if (!postsData)
				throw new NotFoundException("Posts not found");
			return (postsData);
		}
		catch (error){
			console.log("Error getting user's posts:", error);
			throw new InternalServerErrorException("Could not get user's posts");
		}
		}
	}
