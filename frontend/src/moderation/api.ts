
import { Post } from "../context/UserContext";

const API_URL = "http://localhost:3000";

export const moderationApi = {

	fetchAdminLogs:  async () => {
		const res = await fetch(`${API_URL}/moderation/admin/logs`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch amdin logs failed";
			throw new Error(message);
		}
		return data;
	},

	fetchPendingPostReport: async() => {
		const res = await fetch(`${API_URL}/reports/posts/pending`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch pending post reports failed";
			throw new Error(message);
		}
		return data;
	},

		fetchPendingUserReport: async() => {
		const res = await fetch(`${API_URL}/reports/users/pending`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch pending users reports failed";
			throw new Error(message);
		}
		return data;
	},
}