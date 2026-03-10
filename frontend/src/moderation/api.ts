
import { PostReportType } from "./types";

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

	fetchPendingPostReport: async(): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/pending`, {
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
		const res = await fetch(`${API_URL}/moderation/reports/users/pending`, {
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

	assignPendingReport: async(reportId: number) => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/assign`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Assign report failed";
			throw new Error(message);
		}
		return data;
	},

		unassignPendingReport: async(reportId: number) => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/unassign`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Unassign report failed";
			throw new Error(message);
		}
		return data;
	},
}