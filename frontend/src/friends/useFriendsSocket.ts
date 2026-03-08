import { useEffect } from "react";
import { friendsSocket } from "../socket/socket";

export const useFriendsSocket = (userId: number | undefined, onEvent: {
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
}) => {

	useEffect(() => {
		if (!userId) return;

		if (!friendsSocket.connected) {
			friendsSocket.connect();
		}

		friendsSocket.off("connect");
		friendsSocket.on("connect", () => {
			friendsSocket.emit("joinRelations", { userId });
		});

		if (friendsSocket.connected) {
			friendsSocket.emit("joinRelations", { userId });
		}
		
		if (onEvent.onRequestSent) friendsSocket.on("friend_request_sent", onEvent.onRequestSent);
		if (onEvent.onRequestReceived) friendsSocket.on("friend_request_received", onEvent.onRequestReceived);
		if (onEvent.onRequestUnsent) friendsSocket.on("friend_request_unsent", onEvent.onRequestUnsent);
		if (onEvent.onRequestAccepted) friendsSocket.on("friend_request_accepted", onEvent.onRequestAccepted);
		if (onEvent.onRequestRejected) friendsSocket.on("friend_request_rejected", onEvent.onRequestRejected);
		if (onEvent.onFriendRemoved) friendsSocket.on("friend_removed", onEvent.onFriendRemoved);
		if (onEvent.onUserRemoved) friendsSocket.on("you_were_removed", onEvent.onUserRemoved);
		if (onEvent.onUserBlocked) friendsSocket.on("friend_blocked", onEvent.onUserBlocked);
		if (onEvent.onUserUnblocked) friendsSocket.on("friend_unblocked", onEvent.onUserUnblocked);
		if (onEvent.onYouWereBlocked) friendsSocket.on("you_were_blocked", onEvent.onYouWereBlocked);
		if (onEvent.onYouWereUnblocked) friendsSocket.on("you_were_unblocked", onEvent.onYouWereUnblocked);
		

		return () => {
			if (onEvent.onRequestSent) friendsSocket.off("friend_request_sent", onEvent.onRequestSent);
			if (onEvent.onRequestReceived) friendsSocket.off("friend_request_received", onEvent.onRequestReceived);
			if (onEvent.onRequestUnsent) friendsSocket.off("friend_request_unsent", onEvent.onRequestUnsent);
			if (onEvent.onRequestAccepted) friendsSocket.off("friend_request_accepted", onEvent.onRequestAccepted);
			if (onEvent.onRequestRejected) friendsSocket.off("friend_request_rejected", onEvent.onRequestRejected);
			if (onEvent.onFriendRemoved) friendsSocket.off("friend_removed", onEvent.onFriendRemoved);
			if (onEvent.onUserRemoved) friendsSocket.off("you_were_removed", onEvent.onUserRemoved);
			if (onEvent.onUserBlocked) friendsSocket.off("friend_blocked", onEvent.onUserBlocked);
			if (onEvent.onUserUnblocked) friendsSocket.off("friend_unblocked", onEvent.onUserUnblocked);
		if (onEvent.onYouWereBlocked) friendsSocket.off("you_were_blocked", onEvent.onYouWereBlocked);
		if (onEvent.onYouWereUnblocked) friendsSocket.off("you_were_unblocked", onEvent.onYouWereUnblocked);
		};
	}, [userId]);

	const emit = (event: string, data: any) => {
		friendsSocket.emit(event, data);
	};

	return { emit };
};