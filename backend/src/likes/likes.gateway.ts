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
import { LikesService } from './likes.service';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
})

export class LikesGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private likesService: LikesService) {}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected': ${client.id}`);
	}

	@SubscribeMessage('toggle_like')
	async handleToggleLike(
		@MessageBody() data: { postId: number; userId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.likesService.toggleLike(
			data.postId,
			data.userId,
		);

		this.server.emit('like_updated', {
			postId: data.postId,
			liked: result.liked,
			count: result.count,
			userId: data.userId,
		});
		return result;
	}
}