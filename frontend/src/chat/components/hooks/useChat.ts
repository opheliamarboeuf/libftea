import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatSocket } from '../../../socket/socket';

const API_URL = import.meta.env.VITE_API_URL;

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
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(null);
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

  useEffect(() => {
    setChatError('');
    setIsTyping(false);
    messagesRef.current = [];
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const socket = io(`${API_URL}/chat`, { withCredentials: true });
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
      // messagesRef.current est toujours à jour grâce à setMessagesSync
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

  return { messages, sendMessage, chatError, isTyping, emitTyping, lastReadMessageId };
}
