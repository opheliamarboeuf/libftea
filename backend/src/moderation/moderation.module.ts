import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
	imports: [AuthModule, MailModule],
	controllers: [ModerationController],
	providers: [ModerationService],
})
export class ModerationModule {}
