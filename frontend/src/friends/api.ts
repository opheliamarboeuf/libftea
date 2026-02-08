const API_URL = 'http://localhost:3000/friends';

export const friendsApi = {
	getFriends: async () => {
		const res = await fetch(API_URL, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	getPendingRequests: async () => {
		const res = await fetch(`${API_URL}/pending`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	sendFriendRequest: async (addresseId: number) => {
		const res = await fetch(`${API_URL}/request/${addresseId}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	acceptFriendRequest: async (requesterId: number) => {
	const res = await fetch(`${API_URL}/accept/${requesterId}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	rejectFriendRequest: async (requesterId: number) => {
		await fetch(`${API_URL}/reject/${requesterId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
	},
};

