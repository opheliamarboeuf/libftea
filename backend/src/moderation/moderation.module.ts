import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [ModerationController],
	providers: [ModerationService],
})
export class ModerationModule {}
