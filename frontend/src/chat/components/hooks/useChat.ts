import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatSocket } from '../../../socket/socket';
import { tournamentApi } from '../../../tournament/api';

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

export function useChat(conversationId: number, currentUserId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatError, setChatError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(null);
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  // Met à jour le ref synchroniquement avec le state
  const setMessagesSync = (updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  };

  const setErrorWithTimeout = (msg: string, duration = 3000) => {
    setChatError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setChatError(''), duration);
  };

  // Charge le tournoi récent (en cours ou terminé depuis moins de 24h)
  useEffect(() => {
    const loadTournament = async () => {
      try {
        const tournament = await tournamentApi.getRecentTournament();
        setTournamentState(tournament ?? null);
      } catch {
        setTournamentState(null);
      }
    };
    loadTournament();
  }, [conversationId]);

  // Socket chat
  useEffect(() => {
    setChatError('');
    setIsTyping(false);
    messagesRef.current = [];
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const socket = io('http://localhost:3000/chat', { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinConversation', { conversationId });
      socket.emit('getMessages', { conversationId });
      chatSocket.emit('markRead', { conversationId, userId: currentUserId });
    });

    socket.on('messageHistory', (msgs: Message[]) => {
      messagesRef.current = msgs;
      setMessages(msgs);
    });

    socket.on('newMessage', (msg: Message) => {
      setMessagesSync(prev => [...prev, msg]);
      setIsTyping(false);
      if (msg.senderId !== currentUserId) {
        chatSocket.emit('markRead', { conversationId, userId: currentUserId });
      }
    });

    socket.on('error', (data: { message: string }) => setErrorWithTimeout(data.message));

    socket.on('userTyping', () => {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on('userStoppedTyping', () => {
      setIsTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    });

    const handleMessageRead = () => {
      const myMessages = messagesRef.current.filter(m => m.senderId === currentUserId);
      if (myMessages.length > 0) {
        setLastReadMessageId(myMessages[myMessages.length - 1].id);
      }
    };
    chatSocket.on('messageRead', handleMessageRead);

    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.emit('leaveConversation', { conversationId });
      socket.disconnect();
      chatSocket.off('messageRead', handleMessageRead);
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit('sendMessage', {
      content,
      conversationId,
      senderId: currentUserId,
    });
    if (isTypingRef.current) {
      socketRef.current?.emit('stopTyping', { conversationId, senderId: currentUserId });
      isTypingRef.current = false;
    }
  };

  const sendTournamentMessage = async () => {
    try {
      if (!tournamentState?.id) {
        console.warn('No recent tournament');
        return;
      }

      const isFinished =
        tournamentState.status === 'FINISHED' ||
        (!!tournamentState.endsAt && new Date(tournamentState.endsAt) < new Date());

      const isWinner = tournamentState.winnerId === currentUserId;

      // Si le tournoi est terminé, pas besoin de vérifier la participation
      if (!isFinished) {
        const participants = await tournamentApi.getParticipants(tournamentState.id);
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

      socketRef.current?.emit('sendMessage', {
        content,
        conversationId,
        senderId: currentUserId,
        type,
        metadata: { battleId: tournamentState.id },
      });
    } catch (err) {
      console.error('Tournament message failed:', err);
    }
  };

  const emitTyping = (username: string) => {
    if (!isTypingRef.current) {
      socketRef.current?.emit('typing', { conversationId, senderId: currentUserId, username });
      isTypingRef.current = true;
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { conversationId, senderId: currentUserId });
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
