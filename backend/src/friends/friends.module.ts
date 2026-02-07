import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService, PrismaService],
	exports: [FriendsService],
})
export class FriendsModule {}