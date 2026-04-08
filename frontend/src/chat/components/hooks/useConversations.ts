import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDatabase } from '../../../mockData';

function deduplicateAndSort(data: any[]): any[] {
	const seen = new Map<string, any>();
	for (const conv of data) {
		const key = conv.User.map((u: any) => u.id)
			.sort((a: number, b: number) => a - b)
			.join('-');
		if (!seen.has(key)) {
			seen.set(key, conv);
		} else {
			const existing = seen.get(key);
			const existingDate = existing.Message?.[0]?.createdAt ?? existing.createdAt;
			const convDate = conv.Message?.[0]?.createdAt ?? conv.createdAt;
			if (new Date(convDate) > new Date(existingDate)) {
				seen.set(key, conv);
			}
		}
	}
	return Array.from(seen.values()).sort((a, b) => {
		const aDate = a.Message?.[0]?.createdAt ?? a.createdAt;
		const bDate = b.Message?.[0]?.createdAt ?? b.createdAt;
		return new Date(bDate).getTime() - new Date(aDate).getTime();
	});
}

export interface LastMessage {
	content: string;
	createdAt: string;
	senderId: number;
}

export function useConversations(_currentUserId?: number) {
	const [conversations, setConversations] = useState<any[]>([]);
	const conversationsRef = useRef<any[]>([]);

	const updateLastMessage = useCallback((conversationId: number, message: LastMessage) => {
		setConversations((prev) => {
			const updated = prev.map((conv) =>
				conv.id === conversationId ? { ...conv, Message: [message] } : conv,
			);
			return [...updated].sort((a, b) => {
				const aDate = a.Message?.[0]?.createdAt ?? a.createdAt;
				const bDate = b.Message?.[0]?.createdAt ?? b.createdAt;
				return new Date(bDate).getTime() - new Date(aDate).getTime();
			});
		});
	}, []);

	const removeConversationsWithUser = useCallback((otherUserId: number) => {
		setConversations((prev) =>
			prev.filter((conv) => !conv.User.some((u: any) => u.id === otherUserId)),
		);
	}, []);

	const toConvShape = (conv: any) => {
		const messages = mockDatabase.messages
			.filter((m) => m.conversationId === conv.id)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.map((m) => ({
				id: m.id,
				content: m.content,
				senderId: m.senderId,
				createdAt: m.createdAt.toISOString(),
				User: { id: m.senderId, username: '', profile: { avatarUrl: '' } },
			}));
		return {
			id: conv.id,
			User: conv.users.map((u: any) => ({
				id: u.id,
				username: u.username,
				profile: { avatarUrl: u.profile?.avatarUrl ?? null },
			})),
			Message: messages.slice(0, 1),
			createdAt: conv.createdAt.toISOString(),
		};
	};

	const fetchConversations = useCallback(() => {
		if (!_currentUserId) return;
		const userConvs = mockDatabase.conversations
			.filter((c) => c.users.some((u) => u.id === _currentUserId))
			.map(toConvShape);
		const deduped = deduplicateAndSort(userConvs);
		setConversations(deduped);
		conversationsRef.current = deduped;
	}, [_currentUserId]);

	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	const openConversation = async (otherUserId: number) => {
		let conv = mockDatabase.conversations.find(
			(c) =>
				c.users.some((u) => u.id === _currentUserId) &&
				c.users.some((u) => u.id === otherUserId),
		);
		if (!conv) {
			const user1 = mockDatabase.users.find((u) => u.id === _currentUserId)!;
			const user2 = mockDatabase.users.find((u) => u.id === otherUserId)!;
			const newId = Math.max(0, ...mockDatabase.conversations.map((c) => c.id)) + 1;
			conv = { id: newId, users: [user1, user2], createdAt: new Date(), messages: [] };
			mockDatabase.conversations.push(conv);
		}
		const shaped = toConvShape(conv);
		setConversations((prev) => {
			const existing = prev.find((c) => c.id === shaped.id);
			if (existing) return prev;
			return [shaped, ...prev];
		});
		return shaped;
	};

	return {
		conversations,
		fetchConversations,
		openConversation,
		updateLastMessage,
		removeConversationsWithUser,
	};
}
