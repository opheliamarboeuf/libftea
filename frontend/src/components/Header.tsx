import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { SearchBar } from "./SearchBar";
import { useTranslation } from 'react-i18next';
import i18n from "../i18n";
import "./Header.css"
import "../App.css"

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const API_URL = "http://localhost:3000";
	const [menuHidden, setMenuHidden] = useState(false);
	//pour les langues
	const { t } = useTranslation();
	const languages = [ 
		{ code: 'fr', label: 'FR'},
		{ code: 'en', label: 'EN'},
	];
	const [ langMenuHidden, setLangMenuHidden ] = useState(true);

	if (!user) return null;

	const handleLogout = () => {
		setMenuHidden(true);
		localStorage.removeItem("token");
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
				<div
					className="language-menu"
					onMouseLeave={() => setLangMenuHidden(true)}
				>
					<button onClick={() => setLangMenuHidden(!langMenuHidden)}>
						{i18n.language.toUpperCase()} ▼
					</button>
					{ !langMenuHidden && (
						<div className="language-dropdown">
							{languages.map(lang => (
								<button
									key={lang.code}
									onClick={() => {
										i18n.changeLanguage(lang.code);
										setLangMenuHidden(true);
									}}
								>
									{lang.label}
								</button>
							))}
						</div>
					)}
				</div>
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