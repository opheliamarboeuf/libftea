import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Notification {
	id: number;
	type: string;
	isRead: boolean;
	message: string;
	createdAt: string;
	metadata: JSON;
	User: {
		id: number;
		username: string;
		role: string;
	};
}

const API_URL = import.meta.env.VITE_API_URL;

export const useNotifications = (userId: number | undefined) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const { t } = useTranslation();

	useEffect(() => {
		if (!userId) return;
		const token = localStorage.getItem('token');
		fetch(`${API_URL}/notifications`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setNotifications(data));
	}, [userId]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const markAsRead = async (notifId: number) => {
		const token = localStorage.getItem('token');
		await fetch(`${API_URL}/notifications/${notifId}/read`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
		});
		setNotifications((prev) =>
			prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
		);
	};

	const markAllAsRead = async () => {
		const token = localStorage.getItem('token');
		await fetch(`${API_URL}/notifications/read-all`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
		});
		setNotifications([]);
	};

	const getNotifMessage = (notif: Notification) => {
		const meta =
			typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;

		switch (notif.type) {
			case 'LIKE':
				return t('notifications.like', { username: meta?.username });
			case 'COMMENT':
				return t('notifications.comment', { username: meta?.username });
			case 'COMMENT_REPLY':
				return t('notifications.replycomment', { username: meta?.username });
			case 'NEW_BATTLE':
				return t('notifications.newbattle', { theme: meta?.theme });
			case 'BATTLE_WIN':
				return t('notifications.battlewinner', { theme: meta?.theme });
			case 'BATTLE_END':
				return t('notifications.battleparticipants', {
					theme: meta?.theme,
					username: meta?.username,
				});
			case 'FRIEND_REQUEST':
				return t('notifications.friendrequest', { username: meta?.username });
			case 'FRIEND_REQUEST_ACCEPTED':
				return t('notifications.friendaccept', { username: meta?.username });
			case 'POST':
				return t('notifications.friendpost', { username: meta?.username });
			case 'ADMIN_PROMOTE':
				return t('notifications.promoteadmin', { username: meta?.username });
			case 'MOD_PROMOTE':
				return t('notifications.promotemod', { username: meta?.username });
			case 'DEMOTED':
				return t('notifications.demote', { username: meta?.username });
			default:
				return notif.message;
		}
	};

	return { notifications, unreadCount, markAsRead, markAllAsRead, getNotifMessage };
};
