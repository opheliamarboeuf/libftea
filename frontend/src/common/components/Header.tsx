import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { SearchBar } from './SearchBar';
import { useFriendsSocket } from '../../friends/useFriendsSocket';
import { UserNameWithRole } from './UserNameWithRole';
import './Header.css';
import '../../App.css';
import { friendsSocket } from '../../socket/socket';
import { notifSocket } from "../../socket/socket";
import { useNotifications } from "../../notifications/useNotifications";
import { MdOutlineNotifications } from "react-icons/md";
import { useTranslation } from "react-i18next";

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser, refreshUser } = useUser();
	const API_URL = import.meta.env.VITE_API_URL;
	const [menuHidden, setMenuHidden] = useState(false);
	const { notifications, unreadCount, markAsRead, markAllAsRead, getNotifMessage } = useNotifications(user?.id);
	const [notifOpen, setNotifOpen] = useState(false);
	const notifRef = useRef<HTMLDivElement | null>(null);
	const { t } = useTranslation();

	useFriendsSocket(user?.id, {
		onRequestSent: () => {
			refreshUser();
		},
		onRequestUnsent: () => {
			refreshUser();
		},
		onRequestReceived: () => {
			refreshUser();
		},
		onRequestAccepted: () => {
			refreshUser();
		},
		onRequestRejected: () => {
			refreshUser();
		},
		onFriendRemoved: () => {
			refreshUser();
		},
		onUserRemoved: () => {
			refreshUser();
		},
		onUserBlocked: () => {
			refreshUser();
		},
		onUserUnblocked: () => {
			refreshUser();
		},
		onYouWereBlocked: () => {
			refreshUser();
		},
		onYouWereUnblocked: () => {
			refreshUser();
		},
		onUserOnline: () => {
			refreshUser();
		},
		onUserOffline: () => {
			refreshUser();
		},
		onOnlineStatus: () => {
			refreshUser();
		},
	});
	
	useEffect(() => {
		const outsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (notifRef.current && !notifRef.current.contains(target)) {
				setNotifOpen(false);
			}
		};
		document.addEventListener("mousedown", outsideClick);

		return () => {
			document.removeEventListener("mousedown", outsideClick);
		};
	}, []);

	if (!user) return null;

	const handleLogout = () => {
		setMenuHidden(true);
		localStorage.removeItem('token');
		friendsSocket.disconnect();
		notifSocket.disconnect();
		setUser(null);
		navigate('/');
	};

	const handleNavigate = (path: string) => {
		setMenuHidden(true);
		navigate(path);
	};

	return (
		<header className="header">
			<div className="header-left">
				<h2 className="app-name" onClick={() => navigate('/feed')}>
					Libftea
				</h2>
			</div>
			<div className="search-bar-container">
				<SearchBar />
			</div>
			<div className="header-right">
				<div className="notif-bell" ref={notifRef}>
					<span onClick={() => setNotifOpen(!notifOpen)}>
						<MdOutlineNotifications />
						{unreadCount > 0 && !notifOpen && <span className="notif-badge">{unreadCount}</span>}
					</span>
					{notifOpen && (
						<div className="notif-dropdown">
							<button onClick={markAllAsRead}>{t('notifications.clear')}</button>
							{notifications.length === 0 && <p>{t('notifications.nonotif')}</p>}
							{notifications.map((n) => (
								<div
									key={n.id}
									className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
									onClick={() => markAsRead(n.id)}
								>
									{getNotifMessage(n)}
								</div>
							))}
						</div>
					)}
				</div>
				<div 
					className={`avatar-menu ${menuHidden ? 'menu-hidden' : ''}`}
					onMouseLeave={() => setMenuHidden(false)}
				>
					<div className="small-avatar-container">
						<p className="header-username">
							<UserNameWithRole username={user.username || ''} role={user.role} />
						</p>
						<div className="small-avatar">
							<img
								src={
									user?.profile?.avatarUrl
										? `${API_URL}${user.profile.avatarUrl}`
										: '/default-avatar.png'
								}
								alt="Small Avatar"
							/>
						</div>
					</div>
					<div className="dropdown-menu">
						<button onClick={() => handleNavigate('/myprofile')}>
							<span className="label">{t('header.profile')}</span>
						</button>
						<button onClick={() => handleNavigate('/settings')}>
							<span className="label">{t('settings.sandp')}</span>
						</button>
						<button onClick={handleLogout}>
							<span className="label">{t('header.logout')}</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};
