// Re-export Friend type from UserContext for convenience
export { Friend as User } from "../context/UserContext";

export interface Friendship {
	id: number;
	status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
	requesterId: number;
	addresseId: number;
}