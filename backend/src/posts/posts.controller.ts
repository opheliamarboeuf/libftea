import { Controller, UseGuards, UseInterceptors, Post, Body, Get, Req, UploadedFile, BadRequestException, ParseIntPipe, Param, Delete, NotFoundException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { PostsDto } from './dto/create.dto';
import { ImageResizeService } from 'src/common/service/image-resize.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
	constructor(
		private readonly postService: PostsService,
		private readonly imageResizeService: ImageResizeService,
	 ) {}

@UseInterceptors(
	FileInterceptor('image', {
		storage: diskStorage({
			destination: './uploads/post',
			filename: (req, file, cb) => {
				const uniqueSuffix =
				Date.now() + '-' + Math.round(Math.random() * 1e9);
				cb(null, uniqueSuffix + extname(file.originalname));
			},
		}),
	}),
)

	@Post('create')
		async create(
			@UploadedFile() file: Express.Multer.File,
			@Body() dto: PostsDto,
			@Req() req: Request & { user: { id: number } },
		){
			if (!file)
				throw new BadRequestException('Image is required');
			
			// Generate image
			const imageUrl = `/uploads/post/${file.filename}`;
			// Resize the picture
			const resizedPath = await this.imageResizeService.resizePost(file.path);
			// Extract file name
			const filename = resizedPath.split('/').pop() || resizedPath.split('\\').pop(); // Handle Windows/Linux paths
			// Set the image URL for the DTO
			dto.imageUrl = `/uploads/post/${filename}`;
			return this.postService.create(req.user.id, dto);
		}
	
	@Get('me')
		async getUserPosts(@Req() req: Request & { user: { id: number } }){
			return this.postService.getUserPosts(req.user.id);
		}
	
	@Delete('delete/:id')
		async deletePost(@Param('id', ParseIntPipe) id: number) {
			const post = await this.postService.getPostById(id);
			if (!post)
					throw new NotFoundException('Post not found');
			if (post.imageUrl) {
				await this.postService.deletePostImage(post.imageUrl);
			}
			return this.postService.deletePost(id);
		}
}
