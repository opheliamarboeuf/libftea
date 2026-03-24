// tournament/api.ts
// helpers for interacting with the backend's tournament endpoints.

const API_URL = "http://localhost:3000";

export const tournamentApi = {
	joinTournament: async (
		battleId: number,
		payload: FormData
	): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament/${battleId}/join`, {
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
				: data.message || "Tournament join failed";
			throw new Error(message);
		}
		return data;
	},

	createTournament: async (payload: any): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Tournament creation failed";
			throw new Error(message);
		}
		return data;
	},

	getRecentTournament: async () => {
		const res = await fetch(`${API_URL}/tournament/recent`, { credentials: 'include' });
		if (!res.ok) return null;
		return res.json();
	},

	getCurrentTournament: async (): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament/current`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		if (res.status === 204)
			return null;
		const text = await res.text();
		const data = text ? JSON.parse(text) : null;
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data?.message || "Fetch current tournament failed";
			throw new Error(message);
		}
		return data;
	},

	getParticipants: async (battleId: number): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament/${battleId}/participants`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch participants failed";
			throw new Error(message);
		}
		return data;
	},

	getBattlePosts: async (battleId: number): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament/${battleId}/posts`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch battle posts failed";
			throw new Error(message);
		}
		return data;
	},

	getLastWinnerPost:async (): Promise<any> => {
		const res = await fetch(`${API_URL}/tournament/last-winner-post`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Fetch last winner post failed";
			throw new Error(message);
		}
		const text = await res.text();
		if (!text) return null;
		return JSON.parse(text);
	},
};
