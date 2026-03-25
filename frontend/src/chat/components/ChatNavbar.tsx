import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { useFriendsSocket } from '../../friends/useFriendsSocket';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  content: string;
  createdAt?: string;
  senderId?: number;
}

interface ConvUser {
  id: number;
  username: string;
  profile?: { avatarUrl?: string };
}

interface Conversation {
  id: number;
  User: ConvUser[];
  Message: Message[];
}

interface ChatNavbarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (convId: number) => void;
}

export function ChatNavbar({ conversations, activeConversationId, onSelectConversation }: ChatNavbarProps) {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/friends/blocked`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlockedUsers(new Set(data.map((u: any) => u.id)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const { emit } = useFriendsSocket(user?.id, {
    onUserOnline: (data) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    },
    onUserOffline: (data) => {
      setOnlineUsers(prev => { const next = new Set(prev); next.delete(data.userId); return next; });
    },
    onOnlineStatus: (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.isOnline) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    },
    // Refetch à chaque changement de blocage
    onUserBlocked: () => fetchBlockedUsers(),
    onUserUnblocked: () => fetchBlockedUsers(),
    onYouWereBlocked: () => fetchBlockedUsers(),
    onYouWereUnblocked: () => fetchBlockedUsers(),
  });

  useEffect(() => {
    conversations.forEach(conv => {
      const other = conv.User.find(u => u.id !== user?.id);
      if (other) emit('get_online_status', { userId: other.id });
    });
  }, [conversations]);

  if (!user) return null;

  const filtered = conversations.filter(conv => {
    const other = conv.User.find(u => u.id !== user.id);
    if (!other) return false;
    if (blockedUsers.has(other.id)) return false;
    return other.username.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{
      width: '280px', flexShrink: 0, height: '100%',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #e5e7eb', backgroundColor: '#fff',
      padding: '12px',
    }}>

      <div style={{ padding: '0', flexShrink: 0, marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px 7px 30px', fontSize: '13px',
              border: '1px solid #e5e7eb', borderRadius: '20px', outline: 'none',
              background: '#f9fafb', color: '#111827', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#fff'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>No conversation yet</p>
        ) : (
          filtered.map(conv => {
            const other = conv.User.find(u => u.id !== user.id);
            const lastMsg = conv.Message[0];
            const isActive = activeConversationId === conv.id;
            const isOnline = other ? onlineUsers.has(other.id) : false;
            const avatarSrc = other?.profile?.avatarUrl
              ? `${API_URL}${other.profile.avatarUrl}`
              : '/default-avatar.png';
            const senderPrefix = lastMsg?.senderId === user.id ? 'You : ' : '';

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', cursor: 'pointer',
                  backgroundColor: isActive ? '#f0f0f0' : 'transparent',
                  borderRadius: isActive ? '8px' : '0',
                  margin: isActive ? '0 8px' : '0',
                  transition: 'background-color 0.2s ease',
                  borderBottom: '1px solid #f3f4f6',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                    <img src={avatarSrc} alt={other?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {isOnline && (
                    <div style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#22c55e', border: '2px solid #fff',
                    }} />
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: isActive ? 600 : 500, margin: 0, fontSize: '0.95rem', color: 'black' }}>
                    {other?.username ?? 'Inconnu'}
                  </p>
                  {lastMsg && (
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#9ca3af' }}>{senderPrefix}</span>{lastMsg.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
