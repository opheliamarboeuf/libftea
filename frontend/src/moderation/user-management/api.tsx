import { ModerationUser } from './types';
import { mockDatabase } from '../../mockData';

const mapToModerationUser = (user: (typeof mockDatabase.users)[0]): ModerationUser => ({
	id: user.id,
	username: user.username,
	role: user.role,
	bannedAt: user.bannedAt ? user.bannedAt.toISOString() : null,
});

export const userManagementApi = {
	fetchAllUsers: async (): Promise<ModerationUser[]> => {
		// Return all users from mock data
		return mockDatabase.users.map(mapToModerationUser);
	},

	fetchAllBanned: async (): Promise<ModerationUser[]> => {
		// Filter banned users from mock data
		return mockDatabase.users.filter((user) => user.bannedAt !== null).map(mapToModerationUser);
	},

	fetchAllAdmin: async (): Promise<ModerationUser[]> => {
		// Filter admin users from mock data
		return mockDatabase.users.filter((user) => user.role === 'ADMIN').map(mapToModerationUser);
	},

	fetchAllMod: async (): Promise<ModerationUser[]> => {
		// Filter moderator users from mock data
		return mockDatabase.users.filter((user) => user.role === 'MOD').map(mapToModerationUser);
	},

	searchAllUsers: async (username?: string): Promise<ModerationUser[]> => {
		if (!username || username.length < 2) return [];

		// Search in mock data
		return mockDatabase.users
			.filter((user) => user.username.toLowerCase().includes(username.toLowerCase()))
			.map(mapToModerationUser);
	},
};
