import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// APP_GUARD is a special NestJS token to register a guard globally
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './user/users.module';
import { ProfileModule } from './profile/profile.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
	PrismaModule,
    AuthModule,
	FriendsModule,
	UsersModule,
	ProfileModule,
	PostsModule,
	LikesModule,
	CommentsModule,
	NotificationsModule,

  ],
  controllers: [AppController], 
  providers: [
	AppService,
  	{
		// All routes are now protected by JWT by default
		provide: APP_GUARD,
		useClass: JwtAuthGuard,
	},
  ],
})
export class AppModule {}
