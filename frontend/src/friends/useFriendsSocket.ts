import { useEffect } from 'react';

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

	// Mock emit function that does nothing
	const emit = (_event: string, _data?: any) => {
		// Silent mock emit
	};

	return { emit };
};
