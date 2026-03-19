import { useEffect, useState } from "react";
import { notifSocket } from "../socket/socket";

export interface Notification {
	id: number;
	type: string;
	isRead: boolean;
	message: string;
	createdAt: string;
}

export const useNotifications = (userId: number | undefined) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const API_URL = "http://localhost:3000";

	useEffect(() => {
		if (!userId) return;
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/notifications`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setNotifications(data));
	}, [userId]);

	useEffect(() => {
		if (!userId) return;
		
		if (!notifSocket.connected) {
			notifSocket.connect();
		}

		notifSocket.off("connect");
		notifSocket.on("connect", () => {
			notifSocket.emit("joinNotif", { userId });
		});

		if (notifSocket.connected) {
			notifSocket.emit("joinNotif", { userId });
		}

		notifSocket.on("notification", (notif: Notification) => {
			setNotifications((prev) => [notif, ...prev]);
		});

		return () => {
			notifSocket.off("notification");
		}
	}, [userId]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const markAsRead = async (notifId: number) => {
		const token = localStorage.getItem("token");
		await fetch(`${API_URL}/notifications/${notifId}/read`, {
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
		});
		setNotifications((prev) =>
			prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
		);
	};

	const markAllAsRead = async () => {
		const token = localStorage.getItem("token");
		await fetch(`${API_URL}/notifications/read-all`, {
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
		});
		setNotifications([]);
	};

	return { notifications, unreadCount, markAsRead, markAllAsRead }
};