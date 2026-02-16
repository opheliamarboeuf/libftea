import { Controller, UseGuards, UseInterceptors, Post, Body, Get, Req } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostService } from './posts.service';
import { PostDto } from './dto/create.dto';

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postService: PostService,
		/*private readonly imageResizeService: ImageResizeService, */
	 ) {}

	@UseGuards(JwtAuthGuard)
	@Post('create')
		async create(
			// @UploadedFiles() files: Express.Multer.File[],
			@Body() dto: PostDto,
			@Req() req: Request & { user: { id: number } },
		){
			return this.postService.create(req.user.id);
		}
}