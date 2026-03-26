import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from '../chat/components/hooks/useConversations';
import { ChatWindow } from '../chat/components/ChatWindow';
import { ChatNavbar } from '../chat/components/ChatNavbar';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import './ChatPage.css';

export function ChatPage() {
  const { user } = useUser();
  const { conversations, openConversation, updateLastMessage } = useConversations(user?.id);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const withUserId = searchParams.get('with');
    if (withUserId) {
      openConversation(Number(withUserId))
        .then(conv => { setActiveConversationId(conv.id); setShowList(false); })
        .catch(console.error);
    }
  }, []);

  if (!user) return null;

  const handleSelectConversation = (convId: number) => {
    setActiveConversationId(convId);
    setShowList(false);
  };

  // Trouve la conversation active et l'autre user
  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherUser = activeConv?.User.find(u => u.id !== user.id);

  return (
    <div className="chat-page-outer">
      <div className={`chat-page-inner ${showList ? 'mobile-show-list' : 'mobile-show-chat'}`}>
        <ChatNavbar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />

        <div className="chat-page-content">
          <button className="chat-back-btn" onClick={() => setShowList(true)}>
            ← {t('chat.backtolist', 'Conversations')}
          </button>
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              currentUserId={user.id}
              otherUser={otherUser}
              onNewMessage={updateLastMessage}
            />
          ) : (
            <div className="chat-no-conv">
              {t('chat.select')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
