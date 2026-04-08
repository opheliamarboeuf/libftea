import { useEffect, useRef, useState } from 'react';
import { mockDatabase } from '../../../mockData';

interface Message {
	id: number;
	content: string;
	senderId: number;
	createdAt: string;
	type?: string;
	metadata?: { battleId: number };
	User: { id: number; username: string; profile: { avatarUrl: string } };
}

interface TournamentState {
	id: number;
	status: string;
	winnerId?: number | null;
	endsAt?: string;
}

// Cache tournoi partagé entre toutes les conversations
let tournamentCache: TournamentState | null | undefined = undefined;

export function useChat(conversationId: number, currentUserId: number) {
	const [messages, setMessages] = useState<Message[]>([]);

	const [isTyping, setIsTyping] = useState(false);
	const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);

	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);
	const messagesRef = useRef<Message[]>([]);
	const storageKey = `lastRead_${conversationId}_${currentUserId}`;

	const setMessagesSync = (updater: (prev: Message[]) => Message[]) => {
		setMessages((prev) => {
			const next = updater(prev);
			messagesRef.current = next;
			return next;
		});
	};

	const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(() => {
		const saved = localStorage.getItem(storageKey);
		return saved ? Number(saved) : null;
	});

	// Charge le tournoi une seule fois (cache partagé entre conversations)
	useEffect(() => {
		if (tournamentCache !== undefined) {
			setTournamentState(tournamentCache);
			return;
		}
		const recent =
			mockDatabase.battles.find((b) => b.status === 'FINISHED' || b.status === 'ONGOING') ??
			null;
		const state = recent
			? {
					id: recent.id,
					status: recent.status,
					winnerId: recent.winnerId,
					endsAt: recent.endsAt.toISOString(),
				}
			: null;
		tournamentCache = state;
		setTournamentState(state);
	}, []);

	// Reset UI and load messages when conversation changes
	useEffect(() => {
		setIsTyping(false);
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

		const saved = localStorage.getItem(storageKey);
		setLastReadMessageId(saved ? Number(saved) : null);

		const conv = mockDatabase.conversations.find((c) => c.id === conversationId);
		const loaded = (
			conv?.messages ??
			mockDatabase.messages.filter((m) => m.conversationId === conversationId)
		)
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
			.map((m) => {
				const author = mockDatabase.users.find((u) => u.id === m.senderId);
				return {
					id: m.id,
					content: m.content,
					senderId: m.senderId,
					createdAt: m.createdAt.toISOString(),
					User: {
						id: m.senderId,
						username: author?.username ?? '',
						profile: { avatarUrl: author?.profile?.avatarUrl ?? '' },
					},
				};
			});

		setMessages(loaded);
		messagesRef.current = loaded;
	}, [conversationId]);

	const sendMessage = (content: string) => {
		// Mock: add message to local state
		const newMessage: Message = {
			id: Math.max(0, ...messages.map((m) => m.id)) + 1,
			content,
			senderId: currentUserId,
			createdAt: new Date().toISOString(),
			User: { id: currentUserId, username: 'Current User', profile: { avatarUrl: '' } },
		};
		setMessagesSync((prev) => [...prev, newMessage]);

		if (isTypingRef.current) {
			isTypingRef.current = false;
		}
	};

	const sendTournamentMessage = async () => {
		try {
			const fresh = mockDatabase.battles.find(
				(b) => b.status === 'FINISHED' || b.status === 'ONGOING',
			);

			if (!fresh?.id) {
				console.warn('No active or recent tournament');
				return;
			}

			const now = new Date();
			const isFinished =
				fresh.status === 'FINISHED' || (fresh.endsAt && new Date(fresh.endsAt) < now);

			const isWinner = fresh.winnerId === currentUserId;

			if (!isFinished) {
				const isParticipant = mockDatabase.battleParticipants.some(
					(p) => p.battleId === fresh.id && p.userId === currentUserId,
				);
				if (!isParticipant) {
					console.warn('User is not a tournament participant');
					return;
				}
			}

			const content =
				isWinner && isFinished
					? 'I won the tournament! Come check it out!✨'
					: 'Join me in the tournament! 💅🏼';

			const type = isWinner && isFinished ? 'tournament_victory' : 'tournament_invite';

			// Mock: add tournament message
			const newMessage: Message = {
				id: Math.max(0, ...messages.map((m) => m.id)) + 1,
				content,
				senderId: currentUserId,
				createdAt: new Date().toISOString(),
				type,
				metadata: { battleId: fresh.id },
				User: { id: currentUserId, username: 'Current User', profile: { avatarUrl: '' } },
			};
			setMessagesSync((prev) => [...prev, newMessage]);
		} catch (err) {
			console.error('Tournament message failed:', err);
		}
	};

	const emitTyping = (_username: string) => {
		if (!isTypingRef.current) {
			setIsTyping(true);
			isTypingRef.current = true;
		}
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		typingTimerRef.current = setTimeout(() => {
			setIsTyping(false);
			isTypingRef.current = false;
		}, 2000);
	};

	return {
		messages,
		sendMessage,
		sendTournamentMessage,
		isTyping,
		emitTyping,
		lastReadMessageId,
		tournamentState,
	};
}
