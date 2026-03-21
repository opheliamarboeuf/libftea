import { ModerationUser } from './types';

const API_URL = 'http://localhost:3000';

export const userManagementApi = {
	fetchAllUsers: async (): Promise<ModerationUser[]> => {
		const res = await fetch(`${API_URL}/users/all`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all users failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllBanned: async (): Promise<ModerationUser[]> => {
		const res = await fetch(`${API_URL}/users/all/ban`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all banned users failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllAdmin: async (): Promise<ModerationUser[]> => {
		const res = await fetch(`${API_URL}/users/all/admin`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all admin users failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllMod: async (): Promise<ModerationUser[]> => {
		const res = await fetch(`${API_URL}/users/all/mod`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all mod users failed';
			throw new Error(message);
		}
		return data;
	},

	searchAllUsers: async (username?: string): Promise<ModerationUser[]> => {
		if (!username || username.length < 2) return [];

		const url = `${API_URL}/users/search?username=${encodeURIComponent(username)}`;

		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all banned users failed';
			throw new Error(message);
		}
		return data;
	},
};
