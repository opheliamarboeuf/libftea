import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { PostsService } from 'src/posts/posts.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly postService: PostsService
	) {}

	@Get('search')
	async searchUsers(@Query('username') username: string) {
		return this.usersService.searchUsername(username);
	}

	@Get('posts')
	async getAllUserPosts(){
		return this.usersService.getAllUserPosts();
	}

	@Get(':id')
	async getUserId(@Param('id') id: string, @Req() req: Request) {
		return this.usersService.findId(Number(id), req.user.id);
	}

	@Get(':id/posts')
	async getUserPosts(@Param('id') id: string){
		return this.postService.getUserPosts(Number(id));
	}
}