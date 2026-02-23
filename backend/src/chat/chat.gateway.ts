import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server , Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private chatService: ChatService) {}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`); 
	}

	@SubscribeMessage('joinConversation')
	async handleJoinConversation(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: number },
	) {
		client.join(`conversation_${data.conversationId}`);
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: number; senderId: number; content: string },
	) {
		const message = await this.chatService.createMessage(
			data.conversationId,
			data.senderId,
			data.content,
		);

		this.server.to(`conversation_${data.conversationId}`).emit('newMessage', message);
		return message;
	}

	@SubscribeMessage('typing')
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: number; userId: number; username: string },
	) {
		client.to(`conversation_${data.conversationId}`).emit('userTyping', {
			userId: data.userId,
			username: data.username,
		});
	}

	@SubscribeMessage('stopTyping')
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: number; userId: number },
	) {
		client.to(`conversation_${data.conversationId}`).emit('userStoppedTyping', {
			userId: data.userId,
		});
	}

	@SubscribeMessage('markAsRead')
	async handleMarkAsRead(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { messageId: number; conversationId: number },
	) {
		await this.chatService.markAsRead(data.messageId);

		this.server.to(`conversation_${data.conversationId}`).emit('messageRead', {
			messageId: data.messageId,
		});
	}
}


