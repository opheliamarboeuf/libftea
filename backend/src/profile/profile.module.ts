import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { AuthModule } from "src/auth/auth.module";
import { ImageResizeService } from "../common/service/image-resize.service"; 
import { UsersModule } from "src/user/users.module";

@Module ({
	imports: [AuthModule, UsersModule],
	controllers: [ProfileController],
	providers: [ProfileService, ImageResizeService],
})

export class ProfileModule {}