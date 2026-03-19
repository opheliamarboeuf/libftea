import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from '../chat/components/hooks/useConversations';
import { ChatWindow } from '../chat/components/ChatWindow';
import { useUser } from "../context/UserContext";


export function ChatPage() {

  const { user } = useUser(); // ← plus de prop currentUser

  const { conversations, openConversation } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const withUserId = searchParams.get('with');
    if (withUserId) {
      openConversation(Number(withUserId))
        .then(conv => setActiveConversationId(conv.id))
        .catch(console.error);
    }
  }, []);


  if (!user) return null; // user pas encore chargé


  return (
    <div style={{ display: 'flex', height: '100vh' }}>

      {/* Sidebar — liste des conversations */}
      <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
        <h2 style={{ padding: '16px' }}>Messages</h2>
        {conversations.map(conv => {

          const other = conv.User.find(u => u.id !== user.id);

          const lastMsg = conv.Message[0];
          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: activeConversationId === conv.id ? '#eff6ff' : 'transparent',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <p style={{ fontWeight: 500, margin: 0 }}>{other?.username}</p>
              {lastMsg && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastMsg.content}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Zone de chat */}
      <div style={{ flex: 1 }}>
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}

            currentUserId={user.id}

          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#9ca3af' }}>
            Sélectionne une conversation
          </div>
        )}
      </div>

    </div>
  );
}
