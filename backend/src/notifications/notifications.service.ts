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
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.LIKE,
					userId: recipientId,
					isRead: false,
					message: `${likerUsername} liked your post`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying like:", err);
		}
		
	}

	async notifyFriendPost(recipientId: number, posterUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.POST,
					userId: recipientId,
					isRead: false,
				message: `${posterUsername} posted an outfit`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying friend post:", err);
		}
		
	}

	async notifyPostCommented(recipientId: number, commenterUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.COMMENT,
					userId: recipientId,
					isRead: false,
					message: `${commenterUsername} commented on your post`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying post comment:", err);
		}
		
	}

	async notifyCommentReplied(recipientId: number, commenterUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.COMMENT_REPLY,
					userId: recipientId,
					isRead: false,
					message: `${commenterUsername} replied to your comment`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying comment reply:", err);
		}
		
	}

	async notifyFriendRequest(recipientId: number, requesterUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.FRIEND_REQUEST,
					userId: recipientId,
					isRead: false,
					message: `${requesterUsername} sent you a friend request`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying friend request:", err);
		}
		
	}

	async notifyFriendRequestAccepted(recipientId: number, newFriendUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.FRIEND_REQUEST_ACCEPTED,
					userId: recipientId,
					isRead: false,
					message: `${newFriendUsername} accepted your friend request`,
				}
			});

			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying friend request accepted:", err);
		}
		
	}

	// async notifyNewBattle(recipientId: number, battleName: string): Promise<void> {
	// 	try {
	// 		const notification = await this.prisma.notification.create({
	// 			data: {
	// 				type: NotificationType.NEW_BATTLE,
	// 				userId: recipientId,
	// 				isRead: false,
	// 				message: `A new tournament has started! The theme is: ${battleName}`,
	// 			}
	// 		});
	// 		this.notificationsGateway.sendToUser(recipientId, notification);
	// 	} catch (err) {
	// 		console.log("Error notifying bnew battle:", err);
	// 	}
	// }

	async notifyBattleWinner(recipientId: number, battleName: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.BATTLE_WIN,
					userId: recipientId,
					isRead: false,
					message: `Congratulations! You have won the tournament for the following theme: ${battleName}!`,
				}
			});
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying battle winner to winner:", err);
		}
	}

	async notifyTournamentParticipants(recipientId: number, battleName: string, winnerUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.BATTLE_END,
					userId: recipientId,
					isRead: false,
					message: `Thank you for participating to the tournament for ${battleName}. The winner is ${winnerUsername}!`,
				}
			});
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying battle winner to participants:", err);
		}
	}

	async notifyPromotionAdmin(recipientId: number, promoterUsername: string): Promise<void> {
		try {
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.ADMIN_PROMOTE,
					userId: recipientId,
					isRead: false,
					message: `${promoterUsername} has promoted you to administrator role`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying promotion:", err);
		}
		
	}

	async notifyPromotionMod(recipientId: number, promoterUsername: string): Promise<void> {
		try {
			console.log("Gateway server:", this.notificationsGateway.server); // ← est-il null ?
        	console.log("Sending notif to:", recipientId);
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.MOD_PROMOTE,
					userId: recipientId,
					isRead: false,
					message: `${promoterUsername} has promoted you to moderator role`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying promotion:", err);
		}
		
	}

	async notifyDemoted(recipientId: number, demoterUsername: string): Promise<void> {
		try {
			console.log("Gateway server:", this.notificationsGateway.server); // ← est-il null ?
        	console.log("Sending notif to:", recipientId);
			const notification = await this.prisma.notification.create({
				data: {
					type: NotificationType.DEMOTED,
					userId: recipientId,
					isRead: false,
					message: `${demoterUsername} has demoted you to user`,
				},
			});
			
			this.notificationsGateway.sendToUser(recipientId, notification);
		} catch (err) {
			console.log("Error notifying demotion:", err);
		}
		
	}

	async getMyNotifications(userId: number): Promise<Notification[]> {
		const notifications = await this.prisma.notification.findMany({
			where: { userId, isRead: false },
			orderBy: { createdAt: 'desc' },
		});

		return notifications;
	}

	async markAsRead(notifId: number): Promise<void> {
		try {
			await this.prisma.notification.update({
				where: { id: notifId },
				data: { isRead: true },
			});
		} catch (err) {
			console.log("Error marking notification as read:", err);
		}
		
	}

	async markAllAsRead(userId: number): Promise<void> {
		try {
			await this.prisma.notification.updateMany({
				where: { userId, isRead: false },
				data: { isRead: true },
			});
		} catch (err) {
			console.log("Error marking all notifications as read:", err);
		}
		
	}

	async deleteNotification(notifId: number): Promise<void> {
		try {
			await this.prisma.notification.delete({
				where: { id: notifId },
			});
		} catch (err) {
			console.log("Error deleting notification:", err);
		}
		
	}
}