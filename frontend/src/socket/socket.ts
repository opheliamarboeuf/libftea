import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
	withCredentials: true
});

export const friendsSocket = io("http://localhost:3000/friends", {
	withCredentials: true,
	autoConnect: false,
});