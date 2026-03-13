import "../App.css";
import "./ChatPage.css";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useModal } from "../context/ModalContext";
import { useDebounce } from "../hooks/useDebounce";

interface Message {
	id: number;
	content: string;
	createdAt: Date;
	Read: boolean;
	senderId: number;
	type?: string;
	battleId?: number;
	sender: {
		id: number;
		username: string;
	};
}

interface Conversation {
	id: number;
	unreadCount: number;
	users: Array<{
		id: number;
		username: string;
		profile: {
			avatarUrl: string | null;
		};
	}>;
	messages: Array<{
		id: number;
		content: string;
		createdAt: string;
		senderId: number;
	}>;
}

const ChatPage = () => {
	const { user } = useUser();

	const { friendId } = useParams<{ friendId: string }>();
	const navigate = useNavigate();
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const [friendInfo, setFriendInfo] = useState<any>(null);
	const [isBlocked, setIsBlocked] = useState(false);
	const [currentBattle, setCurrentBattle] = useState<any>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { showModal } = useModal();

	const token = localStorage.getItem('token') || '';
	const { messages, setMessages, isTyping, sendMessage, startTyping, stopTyping, error, clearError } =
		useChat(conversationId, token);

	useEffect(() => {
		if (!user) return;

		fetch('http://localhost:3000/chat/conversations', {
			headers: { Authorization: `Bearer ${token}` },
		})

			.then((res) => res.json())
			.then((data) => {
				console.log('All conversations:', data);

			
			 data.forEach((conv, i) => {
				console.log(`Conv ${i}:`, conv.id, 'Users:', conv.users.map(u => u.username));
			});

				setConversations(data);
			})
			.catch((err) => console.error('Loading conversations error:', err));
		}, [user, token]);

	useEffect(() => {
		if (error === 'User is blocked') {
			showModal('You cannot send message to this user.');
			clearError();
		}
	}, [error, clearError]);


	useEffect(() => {
		fetch('http://localhost:3000/tournament/current', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setCurrentBattle(data))
			.catch(() => setCurrentBattle(null));
	}, [token]);

	useEffect(() => {
		if (!friendId || !user) return;

		if (Number(friendId) === user.id) {
			showModal("Error: you cannot talk to your self");
			navigate('/feed');
			return;
		}

		// get friend's info
		fetch(`http://localhost:3000/users/${friendId}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setFriendInfo(data))
			.catch((err) => console.error('Friend loading error:', err));

		fetch(`http://localhost:3000/friend`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((friendsData) => {
				// check if user has BLOCKED status
				const friendship = friendsData.find((f: any) =>
				(f.requesterId === user.id && f.addresseId === Number(friendId)) ||
				(f.addresseId === user.id && f.requestedId === Number(friendId))
				);

				if (friendship?.status === 'BLOCKED') {
					setIsBlocked(true);
				}
			})
			.catch((err) => console.error('Block verification error', err));

		// get conv
		fetch(`http://localhost:3000/chat/conversations/${friendId}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => {
				setConversationId(data.id);
				setMessages(data.messages || []);
			})
			.catch((err) => console.error('Conversation loading error:', err));
	}, [friendId, token, user]);

	useEffect(() => {
		if (conversationId && messages.length > 0) {
			markConversationAsRead();
		}
	}, [conversationId, messages.length]);
	
	// automatic scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !user || isBlocked) return;

		sendMessage(newMessage, user.id);
		setNewMessage('');
		stopTyping(user.id);
	};

	// const handleTyping = () => {
	// 	if (!user) return;
	// 	startTyping(user.id, user.username);
	// };

	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleTyping = () => {
		if (!user) return;

		startTyping(user.id, user.username);

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			stopTyping(user.id);
		}, 300);
	};

	const markConversationAsRead = async () => {
		if (!conversationId || !user) return ;

		const promises = messages
			.filter((msg) => msg.senderId !== user.id && !msg.Read)
			.map((msg) => {
				return fetch(`http://localhost:3000/chat/messages/${msg.id}/read`, {
					method: 'PATCH',
					headers: { Authorization: `Bearer ${token}` },
				});
			});

			await Promise.all(promises);

			fetch('http://localhost:3000/chat/conversations', {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => {
					setConversations(data);
			})
			.catch((err) => console.error('Reloading conversations error:', err));
	};

	const sendBattleInvite = async () => {
		if (!currentBattle || !friendInfo || !user) return;

		try {
			await fetch('http://localhost:3000/chat/invite-to-battle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					friendId: friendInfo.id,
					battleId: currentBattle.id,
					battleTheme: currentBattle.theme,
				}),
			});

			fetch(`http://localhost:3000/chat/conversations/${friendInfo.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => setMessages(data.messages || []));
		} catch (err) {
			console.error('Send Invitation error: ', err);
		}
	};

	// search user in all conv
	const getOtherUser = (conv: Conversation) => {
		return conv.users.find((u) => u.id !== user?.id);
	};

	// get last message
	const getLastMessage = (conv: Conversation) => {
		if (conv.messages.length === 0) return 'No message';
		const lastMsg = conv.messages[conv.messages.length - 1];
		return lastMsg.content.length > 30
			? lastMsg.content.substring(0, 30) + '...'
			: lastMsg.content;
	};

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="chat-page">

			<div className="main-content">

				{/* LEFT COLUMN : FRIEND'S PROFILE + CONVERSATIONS LIST */}
				<div className="chat-sidebar">
					{/* current Friend's profile*/}
					<div className="current-friend-profile">
						{friendInfo ? (
							<>
							<div 
								className="friend-avatar"
								onClick={() => navigate(`/users/${friendInfo.id}`)}
								style={{ cursor: 'pointer' }}
							>
								<img
									src={
										friendInfo.profile?.avatarUrl
											? `http://localhost:3000${friendInfo.profile.avatarUrl}`
											: "/assets/images/default-avatar.jpeg"
									}
									alt="Friend Avatar"
								/>
							</div>
							<p
							className="friend-name"
							onClick={() => navigate(`/users/${friendInfo.id}`)}
							style={{ cursor: 'pointer' }}
							>
								{friendInfo.username}
							</p>
							{friendInfo.profile?.displayName && (
								<p className="friend-display-name">{friendInfo.profile?.displayName}</p>
							)}

							{currentBattle && (
								<button 
									className="invite-tournament-btn"
									onClick={sendBattleInvite}
								>
									Invite to join : {currentBattle.theme}
								</button>
							)}
						</>
					) : (
						<p>Select conversation</p>
					)}
				</div>

				{/* SEPARATOR */}
				<div className="sidebar-separator"></div>

				{/* LIST CONV */}
				<div className="conversation-list">
					<h4>Conversations</h4>
					{conversations.length === 0 ? (
						<p className="no-conversations">No conversation</p>
					) : (
						conversations.map((conv) => {
							const otherUser = getOtherUser(conv);
							if (!otherUser) return null;

							const isActive = Number(friendId) === otherUser.id;

							return (
								<div
									key={conv.id}
									className={`conversation-item ${isActive ? 'active' : ''}`}
									onClick={() => navigate(`/chat/${otherUser.id}`)}
								>
									<div className="conversation-avatar-small">
										<img
											src={
												otherUser.profile?.avatarUrl
												? `http://localhost:3000${otherUser.profile.avatarUrl}`
												: "assets/images/defautl-avatar.jpeg"
											}
											alt="Avatar"
										/>
									</div>
									<div className="conversation-info">
										<div className="conversation-header">
											<p className="conversation-username">{otherUser.username}</p>
											{conv.unreadCount > 0 && (
												<span className="unread-badge">{conv.unreadCount}</span>
											)}
										</div>
										<p className="conversation-last-message">
											{getLastMessage(conv)}
										</p>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* RIGHT COLUMN CHAT MESSAGES */}
			<div className="chat-messages-container">
				<div className="chat-header">
					<h3> Chat with {friendInfo?.username || '...'}</h3>
				</div>

				<div className="message-list">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`message ${msg.senderId === user.id ? 'sent' : 'received'} ${
								msg.type === 'BATTLE_INVITE' ? 'battle-invite' : ''
							} ${msg.type === 'BATTLE_NOTIFICATION' ? 'battle-notification' : ''}`}
						>
							{msg.type === 'BATTLE_INVITE' ? (
								<div className="battle-invite-content">
									<div className="battle-invite-icon"></div>
									<div className="battle-invite-text">
										<strong>{msg.sender.username}</strong> invited you to join a tournament!
										<div className="battle-invite-theme">{msg.content}</div>
									</div>
									<button
										className="join-battle-btn"
										onClick={() => navigate('/tournament')}
									>
										Join
									</button>
								</div>
							) : msg.type === 'BATTLE_NOTIFICATION' ? (
								<div className="battle-notification-content">
									<div className="notification-icon">🏆</div>
									<div className="notification-text">{msg.content}</div>
								</div>
							) : (
							<>
								<div className="message-content">
									<strong>{msg.sender.username}:</strong> {msg.content}
								</div>
								<div className="message-time">
									{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</div>
							</>
						)}
					</div>
				))}

					{isTyping && (
						<div className="typing-indicator">
							<em>{friendInfo?.username || 'Someone'} is typing...</em>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* FORM */}
				<form onSubmit={handleSendMessage} className="message-form">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => {
							setNewMessage(e.target.value);
							handleTyping();
						}}
						placeholder="Type your message..."
						className="message-input"
					/>
					<button type="submit" className="send-btn">
						Send
					</button>
				</form>
			</div>
		</div>
	</div>
);
};

export default ChatPage;