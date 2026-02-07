import { Injectable, NotFoundException, InternalServerErrorException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from '@nestjs/jwt';
import { EditDto } from "./dto/edit.dto";

@Injectable()
export class ProfileService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
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
				const updateData: any = {};
				if (dto.bio !== undefined)
					updateData.bio = dto.bio;
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

	async getProfile(userId: number) {
		try {
				const profile = await this.prisma.profile.findUnique({
					where: {userId},
					select: {
						bio: true,
						avatarUrl: true,
						converrUrl: true,
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
