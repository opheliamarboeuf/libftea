import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
	imports: [AuthModule, PostsModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService],
	exports: [UsersService],
})

export class UsersModule {}