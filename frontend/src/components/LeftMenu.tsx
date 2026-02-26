import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { FaCrown, FaHome, FaUser, FaUsers } from "react-icons/fa";
import "./LeftMenu.css"
import "../App.css"

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	if (!user)
		return ;
	
	return (
		<div className="left-menu">
			<div className="menu-item" onClick={() => navigate("/feed")}>
				<FaHome className="icon" />
				<span className="label">Feed</span>
			</div>

			<div className="menu-item" onClick={() => navigate("/myprofile")}>
				<FaUser className="icon" />
				<span className="label">Profile</span>
			</div>

			<div className="menu-item" onClick={() => navigate("/friends")}>
				<FaUsers className="icon" />
				<span className="label">Friends</span>
			</div>

			<div className="menu-item" onClick={() => navigate("/tournament")}>
				<FaCrown className="icon" />
				<span className="label">Tournament</span>
			</div>
		</div>
	);
}