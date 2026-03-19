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
import { TournamentModule } from './tournament/tournament.module';
import { RolesGuard } from './auth/roles.guard';
import { LikesModule } from './likes/likes.module';
import { ModerationModule } from './moderation/moderation.module';
import { CommentsModule } from './comments/comments.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_HOST,
				port: Number(process.env.MAIL_PORT),
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
			},
			defaults: {
				from: '"Libftea" <noreply@libftea.com>',
			},
			template: {
				dir: path.join(__dirname, '..', '..', 'src', 'mail', 'templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: false,
				},
			},
		}),

		PrismaModule,
		AuthModule,
		FriendsModule,
		UsersModule,
		ProfileModule,
		PostsModule,
		TournamentModule,
		LikesModule,
		CommentsModule,

		ModerationModule,
	],

	controllers: [AppController],
	providers: [
		AppService,
		{
			// All routes are now protected by JWT by default
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
