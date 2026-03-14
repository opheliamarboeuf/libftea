const API_URL = 'http://localhost:3000/likes';

export const likesApi = {
	countLikes: async (postId: number) => {
		const res = await fetch(`${API_URL}/${postId}/count`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	toggleLike: async (postId: number) => {
		const res = await fetch(`${API_URL}/${postId}/like`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				'Content-Type': 'application/json'
		} });
		return res.json();
	},

	isLiked: async (postId: number) => {
		const res = await fetch(`${API_URL}/${postId}/status`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				'Content-Type': 'application/json'
		} });
		return res.json();
	}
}