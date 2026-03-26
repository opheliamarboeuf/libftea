import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import { LastMessage } from './hooks/useConversations';
import { useFriendsSocket } from '../../friends/useFriendsSocket';
import { useUser } from '../../context/UserContext';

interface OtherUser {
  id: number;
  username: string;
  profile?: { avatarUrl?: string };
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  type?: string;
  metadata?: { battleId: number };
  User: { id: number; username: string; profile: { avatarUrl: string } };
}

interface Props {
  conversationId: number;
  currentUserId: number;
  otherUser?: OtherUser;
  onNewMessage?: (conversationId: number, message: LastMessage) => void;
}

const API_URL = import.meta.env.VITE_API_URL;
const SCROLL_THRESHOLD = 100;

function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWindow({ conversationId, currentUserId, otherUser, onNewMessage }: Props) {
  const {
    messages,
    sendMessage,
    sendTournamentMessage,
    chatError,
    isTyping,
    emitTyping,
    lastReadMessageId,
    tournamentState,
  } = useChat(conversationId, currentUserId);

  const { showVictoryButton, showTournamentButton } = useMemo(() => {
    const finished =
      !!tournamentState &&
      (tournamentState.status === 'FINISHED' ||
        (!!tournamentState.endsAt && new Date(tournamentState.endsAt) < new Date()));
    const active = !!tournamentState && !finished;
    const winner = tournamentState?.winnerId === currentUserId;
    return {
      showVictoryButton: winner && finished,
      showTournamentButton: active || (winner && finished), // actif OU gagnant d'un tournoi terminé
    };
  }, [tournamentState, currentUserId]);

  const { user } = useUser();
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const navigate = useNavigate();
  const otherUserIdRef = useRef<number | undefined>(otherUser?.id);
  useEffect(() => { otherUserIdRef.current = otherUser?.id; }, [otherUser?.id]);

  const { emit } = useFriendsSocket(user?.id, {
    onUserOnline: (data) => { if (data.userId === otherUserIdRef.current) setIsOnline(true); },
    onUserOffline: (data) => { if (data.userId === otherUserIdRef.current) setIsOnline(false); },
    onOnlineStatus: (data) => { if (data.userId === otherUserIdRef.current) setIsOnline(data.isOnline); },
  });

  useEffect(() => {
    setIsOnline(false);
    if (otherUser?.id) emit('get_online_status', { userId: otherUser.id });
  }, [otherUser?.id]);

  useLayoutEffect(() => {
    if (messages.length > 0 && !initialScrollDoneRef.current) {
      const el = scrollContainerRef.current;
      if (el) { el.scrollTop = el.scrollHeight; initialScrollDoneRef.current = true; }
    }
  }, [messages]);

  useLayoutEffect(() => {
    initialScrollDoneRef.current = false;
    prevLengthRef.current = 0;
    isNearBottomRef.current = true;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversationId]);

  useEffect(() => {
    if (!initialScrollDoneRef.current) return;
    if (messages.length > prevLengthRef.current && messages.length > 0) {
      const latest = messages[messages.length - 1];
      onNewMessage?.(conversationId, { content: latest.content, createdAt: latest.createdAt, senderId: latest.senderId });
      if (isNearBottomRef.current || latest.senderId === currentUserId) {
        const el = scrollContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isTyping && isNearBottomRef.current) {
      const el = scrollContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [isTyping]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const avatarSrc = otherUser?.profile?.avatarUrl
    ? `${API_URL}${otherUser.profile.avatarUrl}`
    : '/default-avatar.png';

  const lastOwnMessageIndex = messages.reduce((last, msg, i) =>
    msg.senderId === currentUserId ? i : last, -1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#fff' }}>

      {/* Barre du haut */}
      <div style={{
        height: '57px', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 20px', borderBottom: '1px solid #111827', flexShrink: 0,
      }}>
        {otherUser && (
          <>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/users/${otherUser.id}`)}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                <img src={avatarSrc} alt={otherUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {isOnline && (
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
              )}
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${otherUser.id}`)}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#111827' }}>{otherUser.username}</p>
              <p style={{ margin: 0, fontSize: '11px', color: isOnline ? '#22c55e' : '#9ca3af' }}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Erreur */}
      {chatError && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', fontSize: 13, padding: '8px 16px', borderBottom: '1px solid #fecaca' }}>
          {chatError}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {(messages as Message[]).map((msg, i) => {
          const isOwn = msg.senderId === currentUserId;
          const showAvatar = !isOwn && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
          const isLastOwn = isOwn && i === lastOwnMessageIndex;
          const msgAvatarSrc = msg.User?.profile?.avatarUrl
            ? `${API_URL}${msg.User.profile.avatarUrl}`
            : '/default-avatar.png';

          const isThisMessageRead = isOwn && msg.id === lastReadMessageId;
					const showSent = isOwn && isLastOwn && (
						lastReadMessageId === null || msg.id > lastReadMessageId
					);
          const isTournamentInvite = msg.type === 'tournament_invite';
          const isTournamentVictory = msg.type === 'tournament_victory';
          const isTournamentMessage = isTournamentInvite || isTournamentVictory;

          const bubbleBg = isOwn
            ? isTournamentVictory ? '#7c3aed' : isTournamentInvite ? '#f59e0b' : '#2563eb'
            : '#f3f4f6';

          return (
            <div key={msg.id}>
              <div style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 }}>
                {!isOwn && (
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {showAvatar && (
                      <div onClick={() => navigate(`/users/${msg.User?.id}`)} style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}>
                        <img src={msgAvatarSrc} alt={msg.User?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                  {!isOwn && showAvatar && (
                    <span onClick={() => navigate(`/users/${msg.User?.id}`)} style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, paddingLeft: 4, cursor: 'pointer' }}>
                      {msg.User?.username}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                    <div style={{
                      padding: '9px 14px', borderRadius: 18,
                      borderBottomRightRadius: isOwn ? 4 : 18,
                      borderBottomLeftRadius: isOwn ? 18 : 4,
                      background: bubbleBg,
                      color: isOwn ? '#fff' : '#111827',
                      fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                    }}>
                      {msg.content}

                      {/* Bouton visible uniquement pour le destinataire */}
                      {isTournamentMessage && !isOwn && msg.metadata?.battleId && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={() => navigate(`/tournament`)}
                            style={{
                              background: '#fff',
                              color: isTournamentVictory ? '#7c3aed' : '#f59e0b',
                              border: `1.5px solid ${isTournamentVictory ? '#7c3aed' : '#f59e0b'}`,
                              borderRadius: 12,
                              padding: '5px 14px',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isTournamentVictory ? '👑 See the winner' : '🏆 Join Tournament'}
                          </button>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', marginBottom: 2 }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lu */}
              {isThisMessageRead && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 2, paddingRight: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', overflow: 'hidden' }}>
                    <img src={avatarSrc} alt={otherUser?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#2563eb' }}>Read</span>
                </div>
              )}

              {/* Envoyé */}
              {showSent && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, paddingRight: 4 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Send</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 2 }}>
            <div style={{ width: 30, flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden' }}>
                <img src={avatarSrc} alt={otherUser?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 18, borderBottomLeftRadius: 4, background: '#f3f4f6', display: 'flex', alignItems: 'center', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
                  animation: 'typingBounce 1.2s infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 16px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (e.target.value) emitTyping(user?.username ?? '');
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Write a message…"
          rows={1}
          style={{
            flex: 1, resize: 'none', border: '1px solid #e5e7eb', borderRadius: 22,
            padding: '9px 14px', fontSize: 14, lineHeight: 1.5, maxHeight: 120,
            overflowY: 'auto', outline: 'none', fontFamily: 'inherit', color: '#111827', background: '#f9fafb',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#fff'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
        />

        {/* Bouton tournoi — visible seulement si tournoi actif ou terminé depuis moins de 24h */}
        {showTournamentButton && (
          <button
            onClick={sendTournamentMessage}
            title={showVictoryButton ? 'Share your victory' : 'Invite to tournament'}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none',
              background: showVictoryButton ? '#7c3aed' : '#f59e0b',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
              fontSize: 18,
            }}
          >
            {showVictoryButton ? '👑' : '🏆'}
          </button>
        )}

        {/* Bouton envoi normal */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: input.trim() ? '#2563eb' : '#e5e7eb',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={input.trim() ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
