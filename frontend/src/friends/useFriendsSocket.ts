import { useEffect, useCallback } from 'react';
import { mockDatabase, createNotification } from '../mockData';

export const useFriendsSocket = (
	userId: number | undefined,
	_onEvent: {
		onUserOnline?: (data: { userId: number }) => void;
		onUserOffline?: (data: { userId: number }) => void;
		onOnlineStatus?: (data: { userId: number; isOnline: boolean }) => void;
		onRequestSent?: (data: any) => void;
		onRequestReceived?: (data: any) => void;
		onRequestUnsent?: (data: any) => void;
		onRequestAccepted?: (data: any) => void;
		onRequestRejected?: (data: any) => void;
		onFriendRemoved?: (data: any) => void;
		onUserRemoved?: (data: any) => void;
		onUserBlocked?: (data: any) => void;
		onUserUnblocked?: (data: any) => void;
		onYouWereBlocked?: (data: any) => void;
		onYouWereUnblocked?: (data: any) => void;
	},
) => {
	useEffect(() => {
		// No socket in mock mode
	}, [userId]);

	const emit = useCallback((event: string, data?: any) => {
		if (event === 'accept_friend_request') {
			const { requesterId, addresseId } = data;
			const friendship = mockDatabase.friendships.find(
				(f) => f.requesterId === requesterId && f.addresseId === addresseId && f.status === 'PENDING',
			);
			if (friendship) {
				friendship.status = 'ACCEPTED';
				// Notify the requester that their request was accepted
				const accepter = mockDatabase.users.find((u) => u.id === addresseId);
				if (accepter) {
					createNotification(requesterId, 'FRIEND_REQUEST_ACCEPTED', { username: accepter.username });
				}
			}
			_onEvent.onRequestAccepted?.(data);
		} else if (event === 'reject_friend_request') {
			const { requesterId, addresseId } = data;
			const idx = mockDatabase.friendships.findIndex(
				(f) => f.requesterId === requesterId && f.addresseId === addresseId && f.status === 'PENDING',
			);
			if (idx > -1) {
				mockDatabase.friendships.splice(idx, 1);
			}
			_onEvent.onRequestRejected?.(data);
		} else if (event === 'send_friend_request') {
			const { requesterId, addresseId } = data;
			const exists = mockDatabase.friendships.some(
				(f) =>
					(f.requesterId === requesterId && f.addresseId === addresseId) ||
					(f.requesterId === addresseId && f.addresseId === requesterId),
			);
			if (!exists) {
				mockDatabase.friendships.push({
					id: Math.max(0, ...mockDatabase.friendships.map((f) => f.id)) + 1,
					requesterId,
					addresseId,
					status: 'PENDING',
					createdAt: new Date(),
				});
				const requester = mockDatabase.users.find((u) => u.id === requesterId);
				if (requester) {
					createNotification(addresseId, 'FRIEND_REQUEST', { username: requester.username });
				}
			}
			_onEvent.onRequestSent?.(data);
		} else if (event === 'unsend_friend_request') {
			const { requesterId, addresseId } = data;
			const idx = mockDatabase.friendships.findIndex(
				(f) => f.requesterId === requesterId && f.addresseId === addresseId && f.status === 'PENDING',
			);
			if (idx > -1) {
				mockDatabase.friendships.splice(idx, 1);
			}
			_onEvent.onRequestUnsent?.(data);
		} else if (event === 'remove_friend') {
			const { userId: uid, friendId } = data;
			const idx = mockDatabase.friendships.findIndex(
				(f) =>
					((f.requesterId === uid && f.addresseId === friendId) ||
					(f.requesterId === friendId && f.addresseId === uid)) &&
					f.status === 'ACCEPTED',
			);
			if (idx > -1) {
				mockDatabase.friendships.splice(idx, 1);
			}
			_onEvent.onFriendRemoved?.(data);
		}
	}, [_onEvent]);

	return { emit };
};
