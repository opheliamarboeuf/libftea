import { useEffect, useState } from "react";
import { friendsApi } from "./api";
import { User } from "./types";

export function useFriends() {
	const [friends, setFriends] = useState<User[]>([]);

	useEffect(() => {
		friendsApi.getFriends().then(setFriends);
	}, []);

	return { friends };
}

export function usePendingRequests() {
	const [pending, setPending] = useState<User[]>([]);

	useEffect(() => {
		friendsApi.getPendingRequests().then(setPending);
	}, []);

	return { pending };
}