import { useState, useEffect, useCallback, useRef } from 'react';
import { friendsSocket, chatSocket } from '../../../socket/socket'; // adapte si besoin

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

  const removeConversationsWithUser = useCallback((otherUserId: number) => {
    setConversations(prev =>
      prev.filter(conv => !conv.User.some((u: any) => u.id === otherUserId))
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
        // Rejoindre toutes les convs sur le socket global
        deduped.forEach(conv => {
          chatSocket.emit('joinConversation', { conversationId: conv.id });
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Connecte le socket global chat si pas déjà connecté
    if (!chatSocket.connected) chatSocket.connect();

    chatSocket.on('connect', () => {
      conversationsRef.current.forEach(conv => {
        chatSocket.emit('joinConversation', { conversationId: conv.id });
      });
    });

    chatSocket.on('newMessage', (msg: any) => {
      updateLastMessage(msg.conversationId, {
        content: msg.content,
        createdAt: msg.createdAt,
        senderId: msg.senderId,
      });
    });

    fetchConversations();

    return () => {
      chatSocket.off('newMessage');
      chatSocket.off('connect');
    };
  }, []);

  // Écoute les events d'amitié
  useEffect(() => {
    if (!currentUserId) return;

    const handleRemoved = (data: any) => {
      // Tente les deux champs possibles selon le payload
      const otherUserId =
        data?.requesterId === currentUserId ? data?.addresseId :
        data?.addresseId === currentUserId ? data?.requesterId :
        data?.userId === currentUserId ? data?.friendId :
        data?.friendId;
      if (otherUserId) removeConversationsWithUser(otherUserId);
    };

    const handleBlockChange = () => fetchConversations();

    friendsSocket.on('friend_removed', handleRemoved);
    friendsSocket.on('you_were_removed', handleRemoved);
    friendsSocket.on('friend_blocked', handleBlockChange);
    friendsSocket.on('you_were_blocked', handleBlockChange);
    friendsSocket.on('friend_unblocked', handleBlockChange);
    friendsSocket.on('you_were_unblocked', handleBlockChange);

    return () => {
      friendsSocket.off('friend_removed', handleRemoved);
      friendsSocket.off('you_were_removed', handleRemoved);
      friendsSocket.off('friend_blocked', handleBlockChange);
      friendsSocket.off('you_were_blocked', handleBlockChange);
      friendsSocket.off('friend_unblocked', handleBlockChange);
      friendsSocket.off('you_were_unblocked', handleBlockChange);
    };
  }, [currentUserId]);

  const openConversation = async (otherUserId: number) => {
    const res = await fetch(`${API_URL}/chat/conversations/${otherUserId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('You must be friends to send messages.');
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
