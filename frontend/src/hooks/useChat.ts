import { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { showModal } from '../App.css'

interface Message {
	id: number;
	content: string;
	createdAt: Date;
	Read: boolean;
	senderId: number;
	conversationId: number;
	sender: {
		id: number;
		username: string;
		profile: any;
	};
}

export const useChat = (conversationId: number | null, token: string) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const socketRef = useRef<Socket | null>(null);

	const clearError = () => {
		setError(null);
	};

	useEffect(() => {
		if (!conversationId || !token) return;

		socketRef.current = io('http://localhost:3000', {
			auth: { token },
		});

		const socket = socketRef.current;

		// join conv
		socket.emit('joinConversation', { conversationId });

		// listen new messages
		socket.on('newMessage', (message: Message) => {
			setMessages((prev) => [...prev, message]);
		});

		// listen "is typing"
		socket.on('userTyping', () => {
			setIsTyping(true);
		});

		socket.on('userStoppedTyping', () => {
			setIsTyping(false);
		});

		// listen message read
		socket.on('messageRead', ({ messageId }: { messageId: number }) => {
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId ? {...msg, Read: true } : msg
				)
			);
		});

		socketRef.current.on('battleNotification', (notification: Message) => {
			setMessages((prev) => [...prev, notification]);
		});

		//clean disconnect
		return () => {
			socket.disconnect();
		};
	}, [conversationId, token]);

	// send message function
	const sendMessage = (content: string, senderId: number) => {
		if (!socketRef.current || !conversationId) return;

		setError(null);

		socketRef.current.emit('sendMessage', {
			conversationId,
			senderId,
			content,
		}, (response: any) => {
			if (response?.error) {
				setError(response.error);
			}
		});
	};

	// start typing function
	const startTyping = (userId: number, username: string) => {
		if (!socketRef.current || !conversationId) return;

		socketRef.current.emit('typing', {
			conversationId,
			userId,
			username,
		});
	};

	const stopTyping = (userId: number) => {
		if (!socketRef.current || !conversationId) return;

		socketRef.current.emit('stopTyping', {
			conversationId,
			userId,
		});
	};

	return {
		messages,
		setMessages,
		isTyping,
		sendMessage,
		startTyping,
		stopTyping,
		error,
		clearError,
	};
};