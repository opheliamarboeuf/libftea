import { useEffect, useRef, useState } from 'react';
import { chatSocket } from '../../../socket/socket';
import { tournamentApi } from '../../../tournament/api';
import i18n from '../../../i18n';

const API_URL = import.meta.env.VITE_API_URL;

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
  const [chatError, setChatError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const storageKey = `lastRead_${conversationId}_${currentUserId}`;

  const setMessagesSync = (updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  };

  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Number(saved) : null;
  });
  const errorMessages = (message: string): string => {
		if (message.includes("pour envoyer")) return 'errors.chat';
	}

  const setErrorWithTimeout = (msg: string, duration = 3000) => {
    const key = errorMessages(msg);
	const trad = key ? i18n.t(key) : msg;
	setChatError(trad);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setChatError(''), duration);
  };

  // Charge le tournoi une seule fois (cache partagé entre conversations)
  useEffect(() => {
    if (tournamentCache !== undefined) {
      setTournamentState(tournamentCache);
      return;
    }
    tournamentApi.getRecentTournament()
      .then(t => {
        tournamentCache = t ?? null;
        setTournamentState(tournamentCache);
      })
      .catch(() => {
        tournamentCache = null;
        setTournamentState(null);
      });
  }, []); // plus de dépendance sur conversationId

  // Socket — réutilise le singleton chatSocket, pas de new io()
  useEffect(() => {
    // Reset immédiat de l'UI
    setMessages([]);
    messagesRef.current = [];
    setChatError('');
    setIsTyping(false);

    const saved = localStorage.getItem(storageKey);
    setLastReadMessageId(saved ? Number(saved) : null);

    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    if (!chatSocket.connected) chatSocket.connect();

    const onConnect = () => {
      chatSocket.emit('joinConversation', { conversationId });
      chatSocket.emit('getMessages', { conversationId });
      chatSocket.emit('markRead', { conversationId, userId: currentUserId });
    };

    const onMessageHistory = (msgs: Message[]) => {
      messagesRef.current = msgs;
      setMessages(msgs);
    };

    const onNewMessage = (msg: Message & { conversationId: number }) => {
      // Ignore les messages d'autres conversations reçus sur le socket global
      if (msg.conversationId !== conversationId) return;
      setMessagesSync(prev => [...prev, msg]);
      setIsTyping(false);
      if (msg.senderId !== currentUserId) {
        chatSocket.emit('markRead', { conversationId, userId: currentUserId });
      }
    };

    const onError = (data: { message: string }) => setErrorWithTimeout(data.message);

    const onUserTyping = () => {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
    };

    const onUserStoppedTyping = () => {
      setIsTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };

    const onMessageRead = () => {
      const myMessages = messagesRef.current.filter(m => m.senderId === currentUserId);
      if (myMessages.length > 0) {
        const lastId = myMessages[myMessages.length - 1].id;
        setLastReadMessageId(lastId);
        localStorage.setItem(storageKey, String(lastId));
      }
    };

    // Si déjà connecté, rejoindre directement sans attendre l'event connect
    if (chatSocket.connected) {
      onConnect();
    } else {
      chatSocket.once('connect', onConnect);
    }

    chatSocket.on('messageHistory', onMessageHistory);
    chatSocket.on('newMessage', onNewMessage);
    chatSocket.on('error', onError);
    chatSocket.on('userTyping', onUserTyping);
    chatSocket.on('userStoppedTyping', onUserStoppedTyping);
    chatSocket.on('messageRead', onMessageRead);

    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      chatSocket.emit('leaveConversation', { conversationId });
      chatSocket.off('connect', onConnect);
      chatSocket.off('messageHistory', onMessageHistory);
      chatSocket.off('newMessage', onNewMessage);
      chatSocket.off('error', onError);
      chatSocket.off('userTyping', onUserTyping);
      chatSocket.off('userStoppedTyping', onUserStoppedTyping);
      chatSocket.off('messageRead', onMessageRead);
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    chatSocket.emit('sendMessage', {
      content,
      conversationId,
      senderId: currentUserId,
    });
    if (isTypingRef.current) {
      chatSocket.emit('stopTyping', { conversationId, senderId: currentUserId });
      isTypingRef.current = false;
    }
  };

  const sendTournamentMessage = async () => {
    try {
      const fresh = await tournamentApi.getRecentTournament();

      if (!fresh?.id) {
        console.warn('No active or recent tournament');
        return;
      }

      const now = new Date();
      const isFinished =
        fresh.status === 'FINISHED' ||
        (fresh.endsAt && new Date(fresh.endsAt) < now);

      const isWinner = fresh.winnerId === currentUserId;

      if (!isFinished) {
        const participants = await tournamentApi.getParticipants(fresh.id);
        const isParticipant = participants.some(
          (p: { userId: number }) => p.userId === currentUserId
        );
        if (!isParticipant) {
          console.warn('User is not a tournament participant');
          return;
        }
      }

      const content =
        isWinner && isFinished
          ? '👑 I won the tournament! Come check it out!'
          : '🏆 Join me in the tournament!';

      const type =
        isWinner && isFinished ? 'tournament_victory' : 'tournament_invite';

      chatSocket.emit('sendMessage', {
        content,
        conversationId,
        senderId: currentUserId,
        type,
        metadata: { battleId: fresh.id },
      });
    } catch (err) {
      console.error('Tournament message failed:', err);
    }
  };

  const emitTyping = (username: string) => {
    if (!isTypingRef.current) {
      chatSocket.emit('typing', { conversationId, senderId: currentUserId, username });
      isTypingRef.current = true;
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      chatSocket.emit('stopTyping', { conversationId, senderId: currentUserId });
      isTypingRef.current = false;
    }, 2000);
  };

  return {
    messages,
    sendMessage,
    sendTournamentMessage,
    chatError,
    isTyping,
    emitTyping,
    lastReadMessageId,
    tournamentState,
  };
}