import { useState, useEffect } from 'react';

export function useConversations() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetch('/api/chat/conversations', { credentials: 'include' })
      .then(r => r.json())
      .then(setConversations);
  }, []);

  const openConversation = async (otherUserId: number) => {
    const res = await fetch(`http://localhost:3000/chat/conversations/${otherUserId}`, {
			method: 'POST',
			credentials: 'include', // ← si tu utilises des cookies
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`, // ← si tu utilises localStorage
  },
})  
	if (!res.ok) throw new Error('Vous devez être amis pour discuter.');

    return res.json();
  };

  return { conversations, openConversation };
}
