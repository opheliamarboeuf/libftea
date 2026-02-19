import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService
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
		return this.usersService.getUserPosts(Number(id));
	}
}