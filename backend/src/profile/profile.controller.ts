import { Controller, Post, Body, Get, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File } from 'multer';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { EditDto } from './dto/edit.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


export interface RequestWithUser extends Request {
	user: {
		sub: number;
  };
}

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}
	
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		AnyFilesInterceptor({
		// Configure how and where the file is stored on disk
		storage: diskStorage({
			destination: './uploads',
			// Function that defines the filename of the stored file
			filename: (req, file, cb) => {
				// Generate a unique suffix using the current timestamp + a random number
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  				// Save the file with the generated unique name while keeping the original file extension 
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

	// Loop through all uploaded files
	files.forEach(file => {
		// If the file field is "avatar", update the profile's avatar URL
		if (file.fieldname === 'avatar') {
			dto.avatarUrl = `/uploads/${file.filename}`;
		}
		// If the file field is "cover", update the cover URL
		if (file.fieldname === 'cover') {
      		dto.coverUrl = `/uploads/${file.filename}`;
		}
	});
    return this.profileService.edit(userId, dto);
}  

	@Get('me')
	getProfile(@Req() req: any) {
		return this.profileService.getProfile(req.user.sub);
	}

}  
