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
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
	namespace: "/notifications",
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
})

export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
		server: Server;

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected': ${client.id}`);
	}

	@SubscribeMessage('joinNotif')
	handleJoinNotif(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: number },
	) {
		client.join(`user_${data.userId}`);
		console.log(`User ${data.userId} joined room user_${data.userId}`);
	}

	sendToUser(userId: number, notification: any) {
		this.server.to(`user_${userId}`).emit('notification', notification);
	}
}