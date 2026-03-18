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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000/chat', { withCredentials: true });
    socketRef.current = socket;

    socket.emit('joinConversation', { conversationId });
    socket.emit('getMessages', { conversationId });

    socket.on('messageHistory', (msgs: Message[]) => setMessages(msgs));
    socket.on('newMessage', (msg: Message) => setMessages(prev => [...prev, msg]));
    socket.on('error', (data: { message: string }) => setChatError(data.message));

    return () => {
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
  };

  return { messages, sendMessage, chatError };
}
