import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { friendsSocket } from '../../../socket/socket'; // adapte le chemin

const API_URL = 'http://localhost:3000';

function deduplicateAndSort(data: any[]): any[] {
  const seen = new Map<string, any>();
  for (const conv of data) {
    const key = conv.User
      .map((u: any) => u.id)
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

export function useConversations(currentUserId?: number) {
  const [conversations, setConversations] = useState<any[]>([]);
  const conversationsRef = useRef<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const updateLastMessage = useCallback((conversationId: number, message: LastMessage) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId ? { ...conv, Message: [message] } : conv
      );
      return [...updated].sort((a, b) => {
        const aDate = a.Message?.[0]?.createdAt ?? a.createdAt;
        const bDate = b.Message?.[0]?.createdAt ?? b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    });
  }, []);

  // Retire toutes les convs avec un user donné
  const removeConversationsWithUser = useCallback((otherUserId: number) => {
    setConversations(prev =>
      prev.filter(conv =>
        !conv.User.some((u: any) => u.id === otherUserId)
      )
    );
  }, []);

  const fetchConversations = useCallback(() => {
    fetch(`${API_URL}/chat/conversations`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const deduped = deduplicateAndSort(data);
        setConversations(deduped);
        conversationsRef.current = deduped;
        if (socketRef.current) {
          deduped.forEach(conv => {
            socketRef.current?.emit('joinConversation', { conversationId: conv.id });
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const socket = io(`${API_URL}/chat`, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      conversationsRef.current.forEach(conv => {
        socket.emit('joinConversation', { conversationId: conv.id });
      });
    });

    socket.on('newMessage', (msg: any) => {
      updateLastMessage(msg.conversationId, {
        content: msg.content,
        createdAt: msg.createdAt,
        senderId: msg.senderId,
      });
    });

    fetchConversations();

    return () => { socket.disconnect(); };
  }, []);

  // Écoute les events d'amitié sur le friendsSocket global
  useEffect(() => {
    if (!currentUserId) return;

    const handleFriendRemoved = (data: any) => {
      // data contient requesterId et addresseId (ou userId et friendId)
      const otherUserId = data.requesterId === currentUserId ? data.addresseId : data.requesterId;
      removeConversationsWithUser(otherUserId);
    };

    const handleYouWereRemoved = (data: any) => {
      const otherUserId = data.requesterId === currentUserId ? data.addresseId : data.requesterId;
      removeConversationsWithUser(otherUserId);
    };

    const handleBlocked = () => fetchConversations();
    const handleUnblocked = () => fetchConversations();

    friendsSocket.on('friend_removed', handleFriendRemoved);
    friendsSocket.on('you_were_removed', handleYouWereRemoved);
    friendsSocket.on('friend_blocked', handleBlocked);
    friendsSocket.on('you_were_blocked', handleBlocked);
    friendsSocket.on('friend_unblocked', handleUnblocked);
    friendsSocket.on('you_were_unblocked', handleUnblocked);

    return () => {
      friendsSocket.off('friend_removed', handleFriendRemoved);
      friendsSocket.off('you_were_removed', handleYouWereRemoved);
      friendsSocket.off('friend_blocked', handleBlocked);
      friendsSocket.off('you_were_blocked', handleBlocked);
      friendsSocket.off('friend_unblocked', handleUnblocked);
      friendsSocket.off('you_were_unblocked', handleUnblocked);
    };
  }, [currentUserId]);

  const openConversation = async (otherUserId: number) => {
    const res = await fetch(`${API_URL}/chat/conversations/${otherUserId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Vous devez être amis pour discuter.');
    const data = await res.json();
    const conv = Array.isArray(data)
      ? data.reduce((best: any, c: any) => {
          const bestDate = best.Message?.[0]?.createdAt ?? best.createdAt;
          const cDate = c.Message?.[0]?.createdAt ?? c.createdAt;
          return new Date(cDate) > new Date(bestDate) ? c : best;
        })
      : data;
    fetchConversations();
    return conv;
  };

  return { conversations, openConversation, updateLastMessage };
}
