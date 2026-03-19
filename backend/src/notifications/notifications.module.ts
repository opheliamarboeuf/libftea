import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsGateway, PrismaService],
	exports: [NotificationsService],
})
export class NotificationsModule {}