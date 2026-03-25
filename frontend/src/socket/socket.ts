import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

export const socket = io(API_URL, {
	withCredentials: true
});

export const friendsSocket = io(`${API_URL}/friends`, {
	withCredentials: true,
	autoConnect: false,
});

export const chatSocket = io("http://localhost:3000/chat", {
  withCredentials: true,
  autoConnect: false,
});

export const notifSocket = io(`${API_URL}/notifications`, {
	withCredentials: true,
	autoConnect: false,
});
