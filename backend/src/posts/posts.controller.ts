import { Controller, UseGuards, UseInterceptors, Post, Body, Get, Req } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { PostsDto } from './dto/create.dto';

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postService: PostsService,
		/*private readonly imageResizeService: ImageResizeService, */
	 ) {}

	@UseGuards(JwtAuthGuard)
	@Post('create')
		async create(
			// @UploadedFiles() files: Express.Multer.File[],
			@Body() dto: PostsDto,
			@Req() req: Request & { user: { id: number } },
		){
			return this.postService.create(req.user.id, dto);
		}
	
	@Get('me')
		async getUserPosts(@Req() req: Request & { user: { id: number } }){
			return this.postService.getUserPosts(req.user.id);
		}
}