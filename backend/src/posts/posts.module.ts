import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { AuthModule } from "src/auth/auth.module";
import { ImageResizeService } from "src/common/service/image-resize.service";
import { NotificationsModule } from "src/notifications/notifications.module";

@Module({
	imports: [AuthModule, NotificationsModule],
	controllers: [PostsController],
	providers: [PostsService, ImageResizeService],
	exports: [PostsService],
})

export class PostsModule {}