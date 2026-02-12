import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [FriendsController],
	providers: [FriendsService, PrismaService],
	exports: [FriendsService],
})
export class FriendsModule {}