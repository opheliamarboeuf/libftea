import { Post } from '../context/UserContext';

const API_URL = "http://localhost:3000";

export const postsApi = {

	createPost: async (
		// title: string,
		// caption?: string,
	): Promise<Post> => {
		const postPayload = {
			title: "Ceci est un titre",
			caption: "Ceci est une caption",
		};

		const res = await fetch(`${API_URL}/posts/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify(postPayload),
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Post creation failed";
			throw new Error(message);
		}
		return data;
	},

	fetchUserPosts:  async (userId: number) => {
	const res = await fetch(`${API_URL}/users/${userId}/posts`, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	
	const data = await res.json();
	if (!res.ok) {
		const message = Array.isArray(data.message)
			? data.message[0]
			: data.message || "Fetch posts failed";
		throw new Error(message);
	}
	return data ?? [];
	}
}
