const API_URL = import.meta.env.VITE_API_URL;

export const likesApi = {
	countLikes: async (postId: number) => {
		const res = await fetch(`${API_URL}/likes/${postId}/count`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		} });
		return res.json();
	},

	toggleLike: async (postId: number) => {
		const res = await fetch(`${API_URL}/likes/${postId}/like`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				'Content-Type': 'application/json'
		} });
		return res.json();
	},

	isLiked: async (postId: number) => {
		const res = await fetch(`${API_URL}/likes/${postId}/status`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				'Content-Type': 'application/json'
		} });
		return res.json();
	}
}