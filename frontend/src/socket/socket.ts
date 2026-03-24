import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
	withCredentials: true
});

export const friendsSocket = io("http://localhost:3000/friends", {
	withCredentials: true,
	autoConnect: false,
});

export const chatSocket = io("http://localhost:3000/chat", {
  withCredentials: true,
  autoConnect: false,
});

export const notifSocket = io("http://localhost:3000/notifications", {
	withCredentials: true,
	autoConnect: false,
});
