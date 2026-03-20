import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  User: { id: number; username: string; profile: { avatarUrl: string } };
}

export function useChat(conversationId: number, currentUserId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatError, setChatError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const setErrorWithTimeout = (msg: string, duration = 3000) => {
    setChatError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setChatError(''), duration);
  };

  useEffect(() => {
    setChatError('');
    setIsTyping(false);
    setIsRead(false);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const socket = io('http://localhost:3000/chat', { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinConversation', { conversationId });
      socket.emit('getMessages', { conversationId });
      // Marque comme lu dès qu'on ouvre la conv
      socket.emit('markRead', { conversationId, userId: currentUserId });
    });

    socket.on('messageHistory', (msgs: Message[]) => setMessages(msgs));

    socket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      if (msg.senderId !== currentUserId) {
        // Message reçu → on marque comme lu immédiatement
        socket.emit('markRead', { conversationId, userId: currentUserId });
      } else {
        // Message envoyé par moi → reset lu
        setIsRead(false);
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

    socket.on('messageRead', () => {
      setIsRead(true);
    });

    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.emit('leaveConversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit('sendMessage', {
      content,
      conversationId,
      senderId: currentUserId,
    });
    setIsRead(false);
    if (isTypingRef.current) {
      socketRef.current?.emit('stopTyping', { conversationId, senderId: currentUserId });
      isTypingRef.current = false;
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

  return { messages, sendMessage, chatError, isTyping, emitTyping, isRead };
}
