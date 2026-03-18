import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	async sendMail(to: string, subject: string, text: string) {
		try {
			console.log('Attempting to send email:', { to, subject });
			const result = await this.mailerService.sendMail({
				to,
				subject,
				text,
			});
			console.log('Email sent successfully:', result);
			return result;
		} catch (error) {
			console.error('Failed to send email:', { to, subject, error: error.message, fullError: error });
			throw error;
		}
	}
}