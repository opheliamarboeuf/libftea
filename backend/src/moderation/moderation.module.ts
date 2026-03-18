import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
	imports: [AuthModule, EmailModule],
	controllers: [ModerationController],
	providers: [ModerationService],
})
export class ModerationModule {}
