import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikesGateway } from './likes.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
	imports: [AuthModule, NotificationsModule],
	controllers: [LikesController],
	providers: [LikesService, LikesGateway, PrismaService],
	exports: [LikesService],
})
export class LikesModule {}