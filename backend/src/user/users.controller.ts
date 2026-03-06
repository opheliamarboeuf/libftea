import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, UnauthorizedException, ParseIntPipe} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { PostsService } from 'src/posts/posts.service';
import { ReportUserDto } from './report.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly postService: PostsService
	) {}

	@Get('search')
	async searchUsers(@Query('username') username: string, @Req() req) {
		return this.usersService.searchUsername(username, req.user.id);
	}

	@Get('posts')
	async getAllUserPosts(@Req() req: Request){
		const currentUserId = req.user?.id;
    	if (!currentUserId) {
        	throw new UnauthorizedException('User not authenticated');
    }
		return this.usersService.getAllUserPosts(currentUserId);
	}

	@Get(':id')
	async getUserId(@Param('id') id: string, @Req() req: Request) {
		return this.usersService.findId(Number(id), req.user.id);
	}

	@Get(':id/posts')
	async getUserPosts(@Param('id') id: string, @Req() req: Request){
		return this.postService.getUserPosts(Number(id), req.user?.id);
	}

	@Post(':id/report')
		async reportUser(
			@Param('id', ParseIntPipe) id: number, 
			@Req() req: Request,
			@Body() dto: ReportUserDto,
		) {
		return this.usersService.reportUser(id, req.user.id, dto);
	}
}