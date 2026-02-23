import "../App.css";
import "./ChatPage.css";
import { Navigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";

interface Message {
	id: number;
	content: string;
	createdAt: Date;
	Read: boolean;
	senderId: number;
	sender: {
		id: number;
		username: string;
	};
}

const ChatPage = () => {
	const { user } = useUser();
	const { friendId } = useParams<{ friendId: string }>();
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const [friendInfo, setFriendInfo] = useState<any>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const token = localStorage.getItem('token') || '';
	const { messages, setMessages, isTyping, sendMessage, startTyping, stopTyping } =
		useChat(conversationId, token);

	useEffect(() => {
		if (!friendId || !user) return;

		console.log('🔍 friendId:', friendId);
		console.log('🔍 user:', user);
		// get friend's info
		fetch(`http://localhost:3000/users/${friendId}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setFriendInfo(data))
			.catch((err) => console.error('Friend loading error:', err));

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


	// automatic scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !user) return;

		sendMessage(newMessage, user.id);
		setNewMessage('');
		stopTyping(user.id);
	};

	const handleTyping = () => {
		if (!user) return;
		startTyping(user.id, user.username);
	};

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="chat-page">
			{/* MAIN CONTENT */}
			<div className="main-content">
				{/* CHAT INFO COLUMN */}
				<div className="chat-info">
					<div className="friend-profile">
						{friendInfo ? (
							<>
							<div className="friend-avatar">
								<img
									src={
										friendInfo.profile?.avatarUrl
										? `http://localhost:3000${friendInfo.profile.avatarUrl}`
										: "/assets/images/default-avatar.jpeg"
									}
									alt="Friend Avatar"
								/>
							</div>
							<p className="friend-name">{friendInfo.username}</p>
							<p className="friend-display-name">
								{friendInfo.profile?.displayName || ''}
							</p>
						</>
					) : (
						<p>Loading...</p>
					)}
				</div>
			</div>

			{/* CHAT MESSAGES */}
			<div className="chat-messages-container">
				<div className="chat-header">
					<h3>Chat with {friendInfo?.username || '...'}</h3>
				</div>

				<div className="message-list">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
						>
							<div className="message-content">
								<strong>{msg.sender.username}:</strong> {msg.content}
							</div>
							<div className="message-time">
								{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</div>
						</div>
					))}

					{isTyping && (
						<div className="typing-indicator">
							<em>Is typing...</em>
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