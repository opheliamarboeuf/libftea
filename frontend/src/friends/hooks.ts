import { useUser } from "../context/UserContext";

export function useFriends() {
	const { user, refreshUser } = useUser();

	return {
		friends: user?.friends ?? [],
		refetch: refreshUser,
	};
}

export function usePendingRequests() {
	const { user, refreshUser } = useUser();

	return {
		pending: user?.pendingRequests ?? [],
		refetch: refreshUser,
	};
}