import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { MdOutlineHome, MdOutlineAccountCircle, MdOutlinePeople, MdOutlineWorkspacePremium, MdOutlineDashboard } from "react-icons/md";
import { useState } from "react";
import "./LeftMenu.css"
import "../../App.css"

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user } = useUser();
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
					<span className="label">Feed</span>
				</div>

				<div className="menu-item" onClick={() => navigate("/myprofile")}>
					<MdOutlineAccountCircle className="icon" />
					<span className="label">Profile</span>
				</div>

				<div className="menu-item" onClick={() => navigate("/friends")}>
					<MdOutlinePeople className="icon" />
					<span className="label">Friends</span>
				</div>

				<div className="menu-item" onClick={() => navigate("/tournament")}>
					<MdOutlineWorkspacePremium className="icon" />
					<span className="label">Tournament</span>
				</div>
				{user.role === "ADMIN" || user.role === "MOD" ? (
				<div className="menu-item" onClick={() => navigate("/dashboard")}>
					<MdOutlineDashboard className="icon" />
					<span className="label">Dashboard</span>
				</div> ) : null}
			</div>
		</>
	);
}