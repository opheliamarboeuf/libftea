import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { AuthModule } from "src/auth/auth.module";
import { ImageResizeService } from "./image-resize.service"; 

@Module ({
	imports: [AuthModule],
	controllers: [ProfileController],
	providers: [ProfileService, ImageResizeService],
})

export class ProfileModule {}