import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { PrismaService } from "src/prisma.service";
import { ProfileService } from "./profile.service";
import { AuthModule } from "src/auth/auth.module";

@Module ({
	imports: [AuthModule],
	controllers: [ProfileController],
	providers: [ProfileService, PrismaService],
})

export class ProfileModule {}