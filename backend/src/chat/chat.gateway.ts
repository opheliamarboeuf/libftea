import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

import { ChatService } from './chat.service';

import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  constructor(private prisma: PrismaService, private chatService: ChatService) {}


  handleConnection(client: Socket) {
    console.log(`Chat connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    console.log(`Chat disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.join(`conversation_${data.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.leave(`conversation_${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateMessageDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { User: { select: { id: true } } },
    });
    const otherUser = conversation?.User.find(u => u.id !== dto.senderId);
    if (!otherUser || !(await this.chatService.areFriends(dto.senderId, otherUser.id))) {
      client.emit('error', { message: 'You must be friends to send messages.' });
      return;
    }


		const message = await this.prisma.message.create({
			data: {
				content: dto.content,
				senderId: dto.senderId,
				conversationId: dto.conversationId,
				type: dto.type ?? 'text',         // ← ajout
				metadata: dto.metadata ?? {},     // ← ajout
			},
			include: {
				User: {
					select: {
						id: true, username: true,
						profile: { select: { avatarUrl: true } },
					},
				},
			},
		});
    // Emit à la room conversion ET à tous les clients du namespace
    this.server
      .to(`conversation_${dto.conversationId}`)
      .emit('newMessage', message);
    return message;
  }

	@SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; senderId: number; username: string },
  ) {
    client.to(`conversation_${data.conversationId}`).emit('userTyping', {
      senderId: data.senderId,
      username: data.username,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; senderId: number },
  ) {
    client.to(`conversation_${data.conversationId}`).emit('userStopTyping', {
      senderId: data.senderId,
    });
  }

	@SubscribeMessage('markRead')
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; userId: number },
  ) {
    // Broadcast à tous dans la conv sauf l'émetteur
    client.to(`conversation_${data.conversationId}`).emit('messageRead', {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId: data.conversationId },
      include: {
        User: {
          select: {
            id: true, username: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    client.emit('messageHistory', messages);
  }
}


