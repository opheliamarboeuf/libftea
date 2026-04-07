import { useState, useEffect, useCallback, useRef } from 'react';
import i18n from 'i18next';

const API_URL = import.meta.env.VITE_API_URL;

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

	const fetchConversations = useCallback(() => {
		fetch(`${API_URL}/chat/conversations`, {
			credentials: 'include',
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		})
			.then((r) => r.json())
			.then((data: any[]) => {
				if (!Array.isArray(data)) return;
				const deduped = deduplicateAndSort(data);
				setConversations(deduped);
				conversationsRef.current = deduped;
			})
			.catch(console.error);
	}, []);

	useEffect(() => {
		fetchConversations();
	}, []);

	const openConversation = async (otherUserId: number) => {
		const res = await fetch(`${API_URL}/chat/conversations/${otherUserId}`, {
			method: 'POST',
			credentials: 'include',
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		});
		if (!res.ok) throw new Error(i18n.t('errors.chat'));
		const data = await res.json();
		const conv = Array.isArray(data)
			? data.reduce((best: any, c: any) => {
					const bestDate = best.Message?.[0]?.createdAt ?? best.createdAt;
					const cDate = c.Message?.[0]?.createdAt ?? c.createdAt;
					return new Date(cDate) > new Date(bestDate) ? c : best;
				})
			: data;

		setConversations((prev) => {
			const existing = prev.find((c) => c.id === conv.id);
			if (existing) return prev;
			return [conv, ...prev];
		});

		return conv;
	};

	return {
		conversations,
		fetchConversations,
		openConversation,
		updateLastMessage,
		removeConversationsWithUser,
	};
}
