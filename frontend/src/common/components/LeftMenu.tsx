import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { FaMessage} from "react-icons/fa6";
import { MdOutlineHome, MdOutlineAccountCircle, MdOutlinePeople, MdOutlineWorkspacePremium, MdOutlineDashboard, MdOutlineChat} from "react-icons/md";
import { useState } from "react";
import "./LeftMenu.css"
import "../../App.css"
import { useTranslation } from "react-i18next";

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const { t } = useTranslation();
	const [isHovered, setIsHovered] = useState(false);

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
		</div>
		</>
	);
}
