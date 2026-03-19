import { Controller, Post, Body, Get, Delete, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	getMyNotifications(@Req() req: Request) {
		const userId = req.user.id;
		return this.notificationsService.getMyNotifications(userId);
	}

	@Patch('read-all')
	markAllAsRead(@Req() req: Request) {
		const userId = req.user.id;
		return this.notificationsService.markAllAsRead(userId);
	}

	@Patch(':id/read')
	markAsRead(@Param('id') id:string) {
		return this.notificationsService.markAsRead(Number(id));
	}

	@Delete(':id')
	deleteNotification(@Param('id') id: string) {
		return this.notificationsService.deleteNotification(Number(id));
	}
}