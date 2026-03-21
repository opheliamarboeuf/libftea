import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_HOST,
				port: Number(process.env.MAIL_PORT),
				secure: false,
			},
			defaults: {
				from: '"Libftea" <no-reply@libftea.com>',
			},
			template: {
				dir: join(__dirname, 'templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
	],
	controllers: [MailController], 
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
