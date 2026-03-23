export type ModerationUser = {
	id: number;
	username: string;
	role: 'USER' | 'MOD' | 'ADMIN';
	bannedAt: string | null;
};
