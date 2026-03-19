import { useState, useEffect, useRef } from 'react';
import { useChat } from './hooks/useChat';

interface Props {
  conversationId: number;
  currentUserId: number;
}

export function ChatWindow({ conversationId, currentUserId }: Props) {
  const { messages, sendMessage, chatError } = useChat(conversationId, currentUserId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      {chatError && (
        <p style={{ color: 'red', padding: '8px' }}>{chatError}</p>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#888' }}>
                {msg.User.username}
              </span>
              <p style={{ margin: '2px 0 0', background: msg.senderId === currentUserId ? '#3b82f6' : '#e5e7eb', color: msg.senderId === currentUserId ? '#fff' : '#000', padding: '8px 12px', borderRadius: '12px' }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #e5e7eb' }}>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Écrire un message..."
        />
        <button onClick={handleSend}>Envoyer</button>
      </div>
    </div>
  );
}
