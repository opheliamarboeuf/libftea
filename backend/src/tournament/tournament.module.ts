import { Module } from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ImageResizeService } from 'src/common/service/image-resize.service';

@Module({
	imports: [NotificationsModule],
	controllers: [TournamentController],
	providers: [TournamentService, ImageResizeService],
	exports: [TournamentService],
})
export class TournamentModule {}
