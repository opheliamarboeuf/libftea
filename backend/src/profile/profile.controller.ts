import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { EditDto } from './dto/edit.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}
	
	@UseGuards(AuthGuard('jwt'))
	@Post('edit')
	edit(@Req() req: any, @Body() dto: EditDto) {
		return this.profileService.edit(req.user.sub, dto);
	}
	
	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	getProfile(@Req() req: any) {
		return this.profileService.getProfile(req.user.sub);
	}
}
