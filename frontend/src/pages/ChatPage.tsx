import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from '../chat/components/hooks/useConversations';
import { ChatWindow } from '../chat/components/ChatWindow';
import { ChatNavbar } from '../chat/components/ChatNavbar';
import { useUser } from '../context/UserContext';

xport function ChatPage() {
  const { user } = useUser();
  const { conversations, openConversation, updateLastMessage } = useConversations(user?.id);
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

  if (!user) return null;

  // Trouve la conversation active et l'autre user
  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherUser = activeConv?.User.find(u => u.id !== user.id);

  return (
    <div style={{
      position: 'fixed', top: '50px', left: '60px',
      width: 'calc(100vw - 60px)', height: 'calc(100vh - 50px)',
      display: 'flex', flexDirection: 'row', overflow: 'hidden',
      backgroundColor: '#fff', color: 'black',
    }}>
      <ChatNavbar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            currentUserId={user.id}
            otherUser={otherUser}
            onNewMessage={updateLastMessage}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '15px' }}>
            Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  );
}
