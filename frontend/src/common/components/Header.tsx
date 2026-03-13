import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { SearchBar } from "./SearchBar";
import { useFriendsSocket } from "../../friends/useFriendsSocket";
import { useTranslation } from 'react-i18next';
import "./Header.css"
import "../../App.css"
import { friendsSocket } from "../../socket/socket";
import "./LanguageMenu"
import LanguageMenu from "./LanguageMenu";

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser, refreshUser } = useUser();
	const API_URL = "http://localhost:3000";
	const [menuHidden, setMenuHidden] = useState(false);

	useFriendsSocket(user?.id, {
		onRequestSent: () => { refreshUser(); },
		onRequestUnsent: () => { refreshUser(); },
		onRequestReceived: () => { refreshUser(); },
		onRequestAccepted: () => { refreshUser(); },
		onRequestRejected: () => { refreshUser(); },
		onFriendRemoved: () => { refreshUser(); },
		onUserRemoved: () => { refreshUser(); },
		onUserBlocked: () => { refreshUser(); },
		onUserUnblocked: () => { refreshUser(); },
		onYouWereBlocked: () => { refreshUser(); },
		onYouWereUnblocked: () => { refreshUser(); },
		onUserOnline: () => { refreshUser(); },
		onUserOffline: () => { refreshUser(); },
		onOnlineStatus: () => { refreshUser(); },
	});
	
	const { t } = useTranslation();

	if (!user) return null;

	const handleLogout = () => {
		setMenuHidden(true);
		localStorage.removeItem("token");
		friendsSocket.disconnect();
		setUser(null);
		navigate('/')
	}

	const handleNavigate = (path: string) => {
		setMenuHidden(true);
		navigate(path);
	}


	return (
		<header className="header">
			<div className="header-left">
				<h2 className="app-name" onClick={() => navigate('/feed')}>
					Libftea
				</h2>
			</div>
			<div className="search-bar-container"><SearchBar /></div>
			<div className="header-right">
				<LanguageMenu />
				<div 
					className={`avatar-menu ${menuHidden ? 'menu-hidden' : ''}`}
					onMouseLeave={() => setMenuHidden(false)}
				>
					<div className="small-avatar-container">
						<p className="header-username">{user.username || ""}</p>
						<div className="small-avatar">
							<img
								src={user.profile.avatarUrl ? `${API_URL}${user.profile.avatarUrl}` : "/default-avatar.png"}
								alt="Small Avatar"
							/>
						</div>
					</div>
					<div className="dropdown-menu">
						<button onClick={() => handleNavigate('/myprofile')}>
							<span className="label">{t('header.profile')}</span>
						</button>
						<button onClick={() => handleNavigate('/settings')}>
							<span className="label">{t('header.settings')}</span>
						</button>
						<button onClick={handleLogout}>
							<span className="label">{t('header.logout')}</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}