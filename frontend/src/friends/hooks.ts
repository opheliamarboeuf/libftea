import { useEffect, useState } from "react";
import { friendsApi } from "./api";
import { User } from "./types";

export function useFriends() {
	const [friends, setFriends] = useState<User[]>([]);

	const fetchFriends = async () => {
		const data = await friendsApi.getFriends();
		setFriends(data);
	}

	useEffect(() => {
		fetchFriends();
	}, []);

	return { friends, refetch: fetchFriends };
}

export function usePendingRequests() {
	const [pending, setPending] = useState<User[]>([]);

	const fetchPending = async () => {
		const data = await friendsApi.getPendingRequests();
		setPending(data);
	}

	useEffect(() => {
		fetchPending();
	}, []);

	return { pending, refetch: fetchPending };
}