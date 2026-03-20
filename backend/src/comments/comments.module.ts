import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsGateway } from './comments.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [AuthModule, NotificationsModule],
    controllers: [CommentsController],
    providers: [CommentsService, CommentsGateway, PrismaService],
    exports: [CommentsService],
})
export class CommentsModule {}
