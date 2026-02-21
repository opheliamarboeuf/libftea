import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Conversation, Message } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	//get or create conv between 2 users
	async getOrCreateConversation(userId1: number, userId2: number) {

		// search existing conv
		let conversation: any = await this.prisma.conversation.findFirst({
			where: {
				AND: [
					{ users: { some: { id: userId1 } } },
					{ users: { some: { id: userId2 } } },
				],
			},
			include: {
				users: {
					select: { id: true, username: true, profile: true},
				},
				messages: {
					orderBy: { createdAt: 'asc'},
					include: {
						sender: {
							select: { id: true, username: true, profile: true},
						},
					},
				},
			},
		});

		// if not, create conv
		if (!conversation) {
			conversation = await this.prisma.conversation.create({
				data: {
					users: {
						connect: [{ id: userId1}, {id: userId2}],
					},
				},
				include: {
					users: {
						select: {id: true, username: true, profile: true},
					},
					messages: true,
				},
			});
		}
	
	return conversation;
	}

	// create new message

	async createMessage(conversationId: number, senderId: number, content:string): Promise<any> {
		return this.prisma.message.create({
			data: {
				content,
				senderId,
				conversationId,
			},
			include: {
				sender: {
					select: { id: true, username: true, profile: true},
				},
			},
		});
	}


	// mark as read
	async markAsRead(messageId: number): Promise<any> {
		return this.prisma.message.update({
			where: { id: messageId },
			data: { Read: true },
		});
	}

	// get all users conv
	async getUserconversations(userId: number): Promise<any> {
		return this.prisma.conversation.findMany({
			where: {
				users: { some: { id: userId } },
			},
			include: {
				users: {
					select: { id: true, username: true, profile: true },
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1, // last message only
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}
}
