// tournament/api.ts
// helpers for interacting with the backend's tournament endpoints.
import i18n from "../i18n";


const API_URL = import.meta.env.VITE_API_URL;

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
				: data.message || i18n.t('tournament.joinfail');
			throw new Error(message);
		}
		return data;
	},

	createTournament: async (payload: any, t: (key: string, options?: any) => string): Promise<any> => {

		const errorMessages = (message: string): string => {
			if (message.includes("already planned")) {
				const match = message.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
				if (match && match.length >= 2) {
					return t('errors.planned', { date1: match[0], date2: match[1] });
				}
			} 
			return t('errors.tfailed');
		}

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
				: data.message || i18n.t('tournament.create');
			console.log("Backend error message:", message);
			throw new Error(errorMessages(message));
		}
		return data;
	},

	getRecentTournament: async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return null; // Protection : pas de token, pas d'appel

			const res = await fetch(`${API_URL}/tournament/recent`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Si c'est une 404, on retourne null proprement sans lever d'alerte
			if (res.status === 404) return null;

			// Si c'est une autre erreur (500, 403, etc.)
			if (!res.ok) {
				console.error(`Error fetching tournament: ${res.status}`);
				return null;
			}

			return await res.json();
		} catch (error) {
			// Protection contre les crashs réseau (ex: serveur éteint)
			console.error("Network error while fetching tournament:", error);
			return null;
		}
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
				: data?.message || i18n.t('tournament.fail');
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
				: data.message || i18n.t('tournament.fetchparticipants');
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
				: data.message || i18n.t('tournament.fetchposts');
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
				: data.message || i18n.t('tournament.fetchlast');
			throw new Error(message);
		}
		const text = await res.text();
		if (!text) return null;
		return JSON.parse(text);
	},
};
