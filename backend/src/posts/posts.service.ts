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
	async getUserPosts(id: number) {
		const userPosts = await this.prisma.post.findMany({
			where: { authorId: id },
			select: {
				id: true,
				authorId: true,
				title: true, 
				caption: true,
				createdAt: true,
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
	};
}
