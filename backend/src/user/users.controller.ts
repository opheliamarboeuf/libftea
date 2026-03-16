import {
	Controller,
	Get,
	Post,
	Body,
	Query,
	Param,
	UseGuards,
	Req,
	UnauthorizedException,
	ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { PostsService } from 'src/posts/posts.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly postService: PostsService,
	) {}

	@Get('search')
	async searchUsers(@Query('username') username: string, @Req() req) {
		return this.usersService.searchUsername(username, req.user.id);
	}

	@Get('posts')
	async getAllUserPosts(@Req() req: Request) {
		const currentUserId = req.user?.id;
		if (!currentUserId) {
			throw new UnauthorizedException('User not authenticated');
		}
		return this.usersService.getAllUserPosts(currentUserId);
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('all/search')
	async searchAllUsers(@Query('username') username: string, @Req() req) {
		return this.usersService.searchAllUsers(username);
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('all')
	async getAllUsers(@Req() req: Request & { user: { role: Role } }) {
		return this.usersService.getAllUsers(req.user.id);
	}

	@Roles(Role.ADMIN)
	@Get('all/ban')
	async getAllBanned(@Req() req: Request & { user: { role: Role } }) {
		return this.usersService.getAllBanned(req.user.id);
	}

	@Roles(Role.ADMIN)
	@Get('all/admin')
	async getAllAdmin(@Req() req: Request & { user: { role: Role } }) {
		return this.usersService.getAllAdmin(req.user.id);
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('all/mod')
	async getAllMod(@Req() req: Request & { user: { role: Role } }) {
		return this.usersService.getAllMod(req.user.id);
	}
	
	@Get(':id')
	async getUserId(@Param('id') id: string, @Req() req: Request) {
		return this.usersService.findId(Number(id), req.user.id);
	}


	@Get(':id/posts')
	async getUserPosts(@Param('id') id: string, @Req() req: Request) {
		return this.postService.getUserPosts(Number(id), req.user?.id);
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Get(':id')
	async findAnyUserById(@Param('id') id: string) {
		return this.usersService.findAnyUserById(Number(id));
	}
}
