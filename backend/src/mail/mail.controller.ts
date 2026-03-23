import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/auth/public.decorator';

@Controller('mail')
export class MailController {
	constructor(private readonly mailService: MailService) {}

	@Public()
	@Post('test')
	async sendTestEmail(
		@Body()
		dto: {
			to: string;
			subject: string;
			text: string;
		},
	) {
		try {
			await this.mailService.sendTestMail(dto.to, dto.subject, dto.text);
			return { message: 'Email sent successfully' };
		} catch (error) {
			return { error: error.message };
		}
	}
}
