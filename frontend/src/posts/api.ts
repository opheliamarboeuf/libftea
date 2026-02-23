import { Post } from '../context/UserContext';
import { PostPayload } from './types';

const API_URL = "http://localhost:3000";

export const postsApi = {

	createPost: async (
		payload: FormData
	): Promise<Post> => {
		const res = await fetch(`${API_URL}/posts/create`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: payload,
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

	fetchUserPosts:  async (userId: number): Promise<Post[]>  => {
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
				: data.message || "Fetch user posts failed";
			throw new Error(message);
		}
		return data ?? [];
	},

	fetchAllUserPosts: async (): Promise<Post[]> => {
		const res = await fetch(`${API_URL}/users/posts`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch all users posts failed";
			throw new Error(message);
		}
		return data ?? [];
	},
}
