
const API_URL = "http://localhost:3000";

export const moderationApi = {

	fetchAdminLogs:  async () => {
		const res = await fetch(`${API_URL}/moderation/admin`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch amdin lofs failed";
			throw new Error(message);
		}
		return data;
	},
}