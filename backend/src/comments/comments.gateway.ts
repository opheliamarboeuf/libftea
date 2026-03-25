import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentsService } from './comments.service';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
})
export class CommentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private commentsService: CommentsService) {}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected': ${client.id}`);
	}

	@SubscribeMessage('create_comment')
	async handleCreateComment(
		@MessageBody() data: { postId: number; userId: number; content: string },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.commentsService.createComment(
			data.postId,
			data.userId,
			data.content,
		);

		this.server.emit('comment_created', result);
		return result;
	}

	@SubscribeMessage('delete_comment')
	async handleDeleteComment(
		@MessageBody() data: { commentId: number; userId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.commentsService.deleteComment(data.commentId, data.userId);

		this.server.emit('comment_deleted', result.deletedId);
		return result;
	}

	@SubscribeMessage('reply_comment')
	async handleReplyComment(
		@MessageBody() data: { parentCommentId: number; userId: number; content: string },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.commentsService.replyComment(
			data.parentCommentId,
			data.userId,
			data.content,
		);

		this.server.emit('comment_replied', {
			...result,
			parentCommentId: data.parentCommentId,
		});
		return result;
	}
}
