import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { FaHome, FaUser, FaUsers, FaComments } from "react-icons/fa";
import { useModal } from "../context/ModalContext";
import "./LeftMenu.css"
import "../App.css"

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const { showModal } = useModal();

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

			<div className="menu-item" onClick={() => {
				if (user.friends && user.friends.length > 0) {
					navigate(`/chat/${user.friends[0].id}`);
				} else {
					showModal("Boo, you don't have friend to talk to...");
				}
			}}>
				<FaComments className="icon" />
				<span className="label">Chat</span>
			</div>
		</div>
	);
}