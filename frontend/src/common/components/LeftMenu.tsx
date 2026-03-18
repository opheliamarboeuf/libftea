import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { MdOutlineHome, MdOutlineAccountCircle, MdOutlinePeople, MdOutlineWorkspacePremium, MdOutlineDashboard } from "react-icons/md";
import "./LeftMenu.css"
import "../../App.css"

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user } = useUser();
	if (!user)
		return ;
	
	
	return (
		<div className="left-menu">
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
			{/* Only show Dashboard if user is ADMIN or MOD */}
			{user.role === "ADMIN" || user.role === "MOD" ? (
			<div className="menu-item" onClick={() => navigate("/dashboard")}>
				<MdOutlineDashboard className="icon" />
				<span className="label">Dashboard</span>
			</div> ) : null}
			</div>
	);
}