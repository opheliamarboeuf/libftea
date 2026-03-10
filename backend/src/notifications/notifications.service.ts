import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Friendship, User, Post, Like, Notification, NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

//quand tu gagnes un tournoi, quand un admin delete ton post, quand qqun reply a ton comment

@Injectable()
export class NotificationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationsGateway: NotificationsGateway,
	) {}

	async notifyPostLiked(recipientId: number, likerUsername: string): Promise<void> {
		const notification = await this.prisma.notification.create({
			data: {
				type: NotificationType.LIKE,
				userId: recipientId,
				isRead: false,
				message: `${likerUsername} liked your post`,
			},
		});
		
		this.notificationsGateway.sendToUser(recipientId, notification);
	}

	async notifyFriendPost(recipientId: number, posterUsername: string): Promise<void> {
		const notification = await this.prisma.notification.create({
			data: {
				type: NotificationType.POST,
				userId: recipientId,
				isRead: false,
			message: `${posterUsername} posted an outfit`,
			},
		});
		
		this.notificationsGateway.sendToUser(recipientId, notification,);
	}

	async notifyPostCommented(recipientId: number, commenterUsername: string): Promise<void> {
		const notification = await this.prisma.notification.create({
			data: {
				type: NotificationType.COMMENT,
				userId: recipientId,
				isRead: false,
				message: `${commenterUsername} commented on your post`,
			},
		});
		
		this.notificationsGateway.sendToUser(recipientId, notification);
	}

	async notifyFriendRequest(recipientId: number, requesterUsername: string): Promise<void> {
		const notification = await this.prisma.notification.create({
			data: {
				type: NotificationType.FRIEND_REQUEST,
				userId: recipientId,
				isRead: false,
				message: `${requesterUsername} sent you a friend request`,
			},
		});
		
		this.notificationsGateway.sendToUser(recipientId, notification);
	}

	async getMyNotifications(userId: number): Promise<Notification[]> {
		const notifications = await this.prisma.notification.findMany({
			where: { userId, isRead: false },
			orderBy: { createdAt: 'desc' },
		});

		return notifications;
	}

	async markAsRead(notifId: number): Promise<void> {
		await this.prisma.notification.update({
			where: { id: notifId },
			data: { isRead: true },
		});
	}

	async markAllAsRead(userId: number): Promise<void> {
		await this.prisma.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true },
		});
	}

	async deleteNotification(notifId: number): Promise<void> {
		await this.prisma.notification.delete({
			where: { id: notifId },
		});
	}
}