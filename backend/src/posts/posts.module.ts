import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from 'src/auth/auth.module';
import { ImageResizeService } from 'src/common/service/image-resize.service';

@Module({
	imports: [AuthModule],
	controllers: [PostsController],
	providers: [PostsService, ImageResizeService],
	exports: [PostsService],
})
export class PostsModule {}
