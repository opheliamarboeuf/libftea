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
import { FriendsService } from './friends.service';

@WebSocketGateway({
	namespace: "/friends",
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
})

export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private friendsService: FriendsService) {}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('joinRelations')
	handleJoinRelation(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: number },
	) {
		client.join(`user_${data.userId}`);
		console.log(`User ${data.userId} joined room user_${data.userId}`);
	}
	
	@SubscribeMessage('send_friend_request')
	async handleSendRequest(
		@MessageBody() data: { requesterId: number, addresseId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.sendFriendRequest(
			data.requesterId,
			data.addresseId,
		);

		this.server.to(`user_${data.requesterId}`).emit('friend_request_sent', result);
		this.server.to(`user_${data.addresseId}`).emit('friend_request_received', result);
		return result;
	}

	@SubscribeMessage('unsend_friend_request')
	async handleUnsendRequest(
		@MessageBody() data: { requesterId: number, addresseId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.cancelRequest(
			data.requesterId,
			data.addresseId,
		);

		this.server.to(`user_${data.requesterId}`).emit('friend_request_unsent', result);
		this.server.to(`user_${data.addresseId}`).emit('friend_request_unsent', result);
		return result;
	}

	@SubscribeMessage('accept_friend_request')
	async handleAcceptRequest(
		@MessageBody() data: { requesterId: number, addresseId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.acceptFriendRequest(
			data.requesterId,
			data.addresseId,
		);

		this.server.to(`user_${data.requesterId}`).emit('friend_request_accepted', result);
		this.server.to(`user_${data.addresseId}`).emit('friend_request_accepted', result);
		return result;
	}

	@SubscribeMessage('reject_friend_request')
	async handleRejectRequest(
		@MessageBody() data: { requesterId: number, addresseId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.rejectFriendRequest(
			data.requesterId,
			data.addresseId,
		);

		this.server.to(`user_${data.requesterId}`).emit('friend_request_rejected', result);
		this.server.to(`user_${data.addresseId}`).emit('friend_request_rejected', result);
		return result;
	}

	@SubscribeMessage('remove_friend')
	async handleRemoveFriend(
		@MessageBody() data: { userId: number, friendId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.removeFriend(
			data.userId,
			data.friendId,
		);

		this.server.to(`user_${data.userId}`).emit('friend_removed', result);
		this.server.to(`user_${data.friendId}`).emit('you_were_removed', result);
		return result;
	}
	
	@SubscribeMessage('block_friend')
	async handleBlockFriend(
		@MessageBody() data: { userId: number, targetId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.blockFriend(
			data.userId,
			data.targetId,
		);

		this.server.to(`user_${data.userId}`).emit('friend_blocked', result);
		this.server.to(`user_${data.targetId}`).emit('you_were_blocked', result);
		return result;
	}
	
	@SubscribeMessage('unblock_friend')
	async handleUnblockFriend(
		@MessageBody() data: { userId: number, targetId: number },
		@ConnectedSocket() client: Socket,
	) {
		const result = await this.friendsService.unBlockFriend(
			data.userId,
			data.targetId,
		);

		this.server.to(`user_${data.userId}`).emit('friend_unblocked', result);
		this.server.to(`user_${data.targetId}`).emit('you_were_unblocked', result);
		return result;
	}
}