export interface User {
	id: number;
	username: string;
	avatarUrl?: string;
}

export interface Friendship {
	id: number;
	status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
	requesterId: number;
	addresseId: number;
}