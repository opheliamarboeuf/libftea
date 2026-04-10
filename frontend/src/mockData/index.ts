/**
 * Mock Data Module

 * This module provides mock data for development and testing purposes.
 * It generates a complete mock database with users, posts, comments, likes,
 * friendships, conversations, messages, moderation logs, reports, and tournaments.
 * 
 * Usage:
 * ```
 * import { seedDatabase, mockDatabase } from '@/mockData';
 * 
 * // Generate mock data
 * const data = seedDatabase();
 * 
 * // Or access the populated database directly
 * import { mockDatabase } from '@/mockData';
 * const users = mockDatabase.users;
 * const posts = mockDatabase.posts;
 * ```
 */

export { seedDatabase, mockDatabase, createNotification, onNotificationChange } from './seed';
export type {
	UserProfile,
	BaseUser,
	Post,
	Comment,
	Like,
	Friendship,
	Conversation,
	Message,
	Notification,
	ModerationLog,
	Report,
	Battle,
	BattleParticipant,
} from './seed';
