const API_URL = import.meta.env.VITE_API_URL;

export const friendsApi = {
	getFriends: async () => {
		const res = await fetch(`${API_URL}/friends`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	getPendingRequests: async () => {
		const res = await fetch(`${API_URL}/friends/pending`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	sendFriendRequest: async (addresseId: number) => {
		const res = await fetch(`${API_URL}/friends/request/${addresseId}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	acceptFriendRequest: async (requesterId: number) => {
	const res = await fetch(`${API_URL}/friends/accept/${requesterId}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	rejectFriendRequest: async (requesterId: number) => {
		await fetch(`${API_URL}/friends/reject/${requesterId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},

	removeFriend: async (friendId: number) => {
		await fetch(`${API_URL}/friends/remove/${friendId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},

	cancelRequest: async (addresseId: number) => {
		await fetch(`${API_URL}/friends/cancel/${addresseId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},

	blockFriend: async (friendId: number) => {
		await fetch(`${API_URL}/friends/block/${friendId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},

	unBlockFriend: async (friendId: number) => {
		await fetch(`${API_URL}/friends/unblock/${friendId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},
};

