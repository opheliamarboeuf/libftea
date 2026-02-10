import { Controller, Post, Body, Get, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File } from 'multer';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { EditDto } from './dto/edit.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ImageResizeService } from './image-resize.service';

export interface RequestWithUser extends Request {
	user: {
		sub: number;
  };
}

@Controller('profile')
export class ProfileController {
	constructor(
		private readonly profileService: ProfileService,
		private readonly imageResizeService: ImageResizeService,
	) {}
	
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		AnyFilesInterceptor({
		storage: diskStorage({
			destination: (req, file, cb) => {
			// Sauvegarder dans le bon sous-dossier selon le type
			if (file.fieldname === 'avatar') {
				cb(null, './uploads/avatar');
			} else if (file.fieldname === 'cover') {
				cb(null, './uploads/cover');
			} else {
				cb(null, './uploads');
			}
			},
			filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			cb(null, uniqueSuffix + extname(file.originalname));
			},
		}),
		}),
	)

	@Post('edit')
	async editProfile(
	@UploadedFiles() files: File[], // Gets all files sent by the client
	@Body() dto: EditDto,
	@Req() req: RequestWithUser,) {
	const userId = req.user.sub; 

	const currentProfile = await this.profileService.getProfile(userId);
	
	for (const file of files) {
		if (file.fieldname === 'avatar') {
			await this.profileService.deleteOldImage(currentProfile.avatarUrl);
			
			// Resize the new avatar (200x200)
			const resizedPath = await this.imageResizeService.resizeAvatar(file.path);
			const filename = resizedPath.split('/').pop() || resizedPath.split('\\').pop(); // Handle Windows/Linux paths
			dto.avatarUrl = `/uploads/avatar/${filename}`;
		}

		if (file.fieldname === 'cover') {
			await this.profileService.deleteOldImage(currentProfile.coverUrl);
			const resizedPath = await this.imageResizeService.resizeCover(file.path);
			const filename = resizedPath.split('/').pop() || resizedPath.split('\\').pop(); // Handle Windows/Linux paths
			dto.coverUrl = `/uploads/cover/${filename}`;
		}
	}
	
	return this.profileService.edit(userId, dto);
}
	@Get('me')
	getProfile(@Req() req: any) {
		return this.profileService.getProfile(req.user.sub);
	}

}  
