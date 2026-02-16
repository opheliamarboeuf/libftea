import { Injectable, NotFoundException, InternalServerErrorException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from '@prisma/client';
import { EditDto } from "./dto/edit.dto";
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ProfileService {
	constructor(
		private prisma: PrismaService,
	) {}
	async edit(userId:number, dto: EditDto) {
		try {
				// Check if the profile exists
				const profile = await this.prisma.profile.findUnique({
					where: {userId}
				});
				if (!profile)
					throw new NotFoundException("Profile not found");
				
				// Build an object containing only fields that are defined in the DTO
				const updateData: Prisma.ProfileUpdateInput = {};
				if (dto.bio !== undefined)
					updateData.bio = dto.bio;
				if (dto.displayName !== undefined)
					updateData.displayName = dto.displayName;
				if (dto.avatarUrl !== undefined)
					updateData.avatarUrl = dto.avatarUrl;
				if (dto.coverUrl !== undefined)
					updateData.coverUrl = dto.coverUrl;
				
				// Update the profile in the database
				const updatedProfile = await this.prisma.profile.update({
					where: {userId},
					data: updateData
				});
				// Return the updated profile
				return (updatedProfile)
			}
		catch (error) {
			console.log("Error updating profile:", error);
			throw new InternalServerErrorException("Could not update profile");
		}
	}

	async deleteOldImage(imageUrl: string): Promise<void> {
		if (!imageUrl)
			return;
		// Ignore default images
    	if (imageUrl.startsWith('/assets/default/'))
			return;
		const relativePath = imageUrl.startsWith('/')
    	? imageUrl.slice(1)
    	: imageUrl;
		// Construct the full file path by combining the project root directory with the relative image URL
		const filePath = join(process.cwd(), imageUrl);
		try {
			// Attempt to delete the file from the file system
			await unlink(filePath);
		}
		catch (error) {
			console.log('Could not delete old image:', error.message);
		}
  	}
	

	async getProfile(userId: number) {
		try {
				const profile = await this.prisma.profile.findUnique({
					where: {userId},
					select: {
						bio: true,
						displayName: true,
						avatarUrl: true,
						coverUrl: true,
					},
				});
				if (!profile)
					throw new NotFoundException("Profile not found");
				return profile;
			}
		catch (error) {
			console.log("Error going to profile:", error);
			throw new InternalServerErrorException("Could not go to profile");
		}
	}
}
