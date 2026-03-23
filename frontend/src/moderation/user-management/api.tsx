import { ModerationUser } from './types';
import i18n from '../../i18n';

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
				: data.message || i18n.t('modfail.fetchusers');
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
				: data.message || i18n.t('modfail.fetchbanned');
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
				: data.message || i18n.t('modfail.fetchadmin');
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
				: data.message || i18n.t('modfail.fetchmod');
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
				: data.message || i18n.t('modfail.fetchusers');
			throw new Error(message);
		}
		return data;
	},
};
