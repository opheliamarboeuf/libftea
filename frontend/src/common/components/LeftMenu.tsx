import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { MdOutlineHome, MdOutlineAccountCircle, MdOutlineLanguage, MdOutlinePeople, MdOutlineWorkspacePremium, MdOutlineDashboard, MdOutlineChat, MdOutlineSwitchAccount} from "react-icons/md";
import { useState } from "react";
import "./LeftMenu.css"
import "../../App.css"
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { mockDatabase } from "../../mockData";
import { toContextUser } from "../../mockData/mockUser";

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const { t } = useTranslation();
	const [isHovered, setIsHovered] = useState(false);
	const [langOpen, setLangOpen] = useState(false);
	const [switcherOpen, setSwitcherOpen] = useState(false);

	const languages = [
		{ code: 'fr', label: 'FR'},
		{ code: 'en', label: 'EN'},
		{ code: 'jp', label: 'JP'},
	];

	if (!user)
		return ;
	
	
	return (
		<>
			<div className={`menu-overlay ${isHovered ? 'active' : ''}`}></div>
			
			<div 
				className="left-menu"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
			<div className="menu-item" onClick={() => navigate("/feed")}>
				<MdOutlineHome className="icon" />
				<span className="label">{t('leftmenu.feed')}</span>
			</div>

			<div className="menu-item" onClick={() => navigate("/myprofile")}>
				<MdOutlineAccountCircle className="icon" />
				<span className="label">{t('leftmenu.profile')}</span>
			</div>

			<div className="menu-item" onClick={() => navigate("/friends")}>
				<MdOutlinePeople className="icon" />
					<span className="label">{t('leftmenu.friends')}</span>
				</div>

			<div className="menu-item" onClick={() => navigate("/chat")}>
				<MdOutlineChat className="icon" />
				<span className="label">{t('chat.chat')}</span>
			</div>
		
			<div className="menu-item" onClick={() => navigate("/tournament")}>
				<MdOutlineWorkspacePremium className="icon" />
				<span className="label">{t('tournament.tournament')}</span>
			</div>
			{user.role === "ADMIN" || user.role === "MOD" ? (
			<div className="menu-item" onClick={() => navigate("/dashboard")}>
				<MdOutlineDashboard className="icon" />
				<span className="label">{t('leftmenu.dashboard')}</span>
			</div> ) : null}
			
			<div className="menu-bottom">
				<div className={`switcher-hover-wrapper ${switcherOpen ? 'open' : ''}`}>
					<div className="switcher-submenu">
						{mockDatabase.users
							.filter(u => u.username !== 'toxic')
							.sort((a, b) => {
								const order = ['ophe', 'cha', 'ari', 'leo','admin', 'mod'];
								return order.indexOf(a.username) - order.indexOf(b.username);
							})
							.map(u => {
								const isActive = u.id === user?.id;
								const isBanned = !!u.bannedAt;

								return (
									<div
										key={u.id}
										className={`switcher-submenu-item ${isActive ? 'active' : ''} ${isBanned ? 'banned' : ''}`}
										onClick={() => { setUser(toContextUser(u)); setSwitcherOpen(false); }}
									>
										<span>{u.username}</span>
									</div>
								);
							})}
					</div>
					<div
						className="menu-item switcher-trigger"
						onClick={() => setSwitcherOpen(prev => !prev)}
					>
						<MdOutlineSwitchAccount className="icon" />
						<span className="label">{user?.username}</span>
					</div>
				</div>

				<div className={`lang-hover-wrapper ${langOpen ? 'open' : ''}`}>
					<div className="lang-submenu">
						{languages.map(lang => (
							<div
								key={lang.code}
								className={`lang-submenu-item ${i18n.language === lang.code ? 'active' : ''}`}
								onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}>
									<span className="lang-submenu-code">{lang.label}</span>
							</div>
						))}
					</div>
					<div
						className="menu-item lang-trigger"
						onClick={() => setLangOpen(prev => !prev)}
					>
						<MdOutlineLanguage className="icon" />
						<span className="label">{i18n.language.toUpperCase()}</span>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}
