import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [FriendsController],
	providers: [FriendsService, FriendsGateway, PrismaService],
	exports: [FriendsService],
})
export class FriendsModule {}