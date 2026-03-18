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
  cors: { origin: 'http://localhost:5173', credentials: true },
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
      client.emit('error', { message: 'Vous devez être amis pour envoyer des messages.' });
      return;
    }


    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        senderId: dto.senderId,
        conversationId: dto.conversationId,
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

    this.server
      .to(`conversation_${dto.conversationId}`)
      .emit('newMessage', message);
    return message;
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
