import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { TournamentModule } from 'src/tournament/tournament.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
	imports: [AuthModule, MailModule, TournamentModule, NotificationsModule],
	controllers: [ModerationController],
	providers: [ModerationService],
})
export class ModerationModule {}
