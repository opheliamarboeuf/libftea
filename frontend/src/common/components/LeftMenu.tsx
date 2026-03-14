import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { FaHome, FaUser, FaUsers, FaComments } from "react-icons/fa";
import { useModal } from "../../context/ModalContext";
import { useState, useEffect } from "react";
import "./LeftMenu.css"
import "../../App.css"

export const LeftMenu = () => {
	
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const [totalUnread, setTotalUnread] = useState(0);
	const token = localStorage.getItem('token') || '';
	const { showModal } = useModal();

	useEffect(() => {
		if (!user) return ;

		fetch('http://localhost:3000/chat/conversations', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => {
				const total = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
				setTotalUnread(total);
			})
			.catch((err) => console.error('Loading conversations error:', err));

		const interval = setInterval(() => {
			fetch('http://localhost:3000/chat/conversations', {
				headers: { Authorization: `Bearer ${token}`},
			})
				.then((res) => res.json())
				.then((data) => {
					const total = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
					setTotalUnread(total);
				});
		}, 10000);

			return () => clearInterval(interval);
	}, [user, token]);

	if (!user) return null;

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

			<div className="menu-item chat-menu-item" onClick={() => {
				if (user.friends && user.friends.length > 0) {
					navigate(`/chat/${user.friends[0].id}`);
				} else {
					showModal("Add a friend to start a conversation.");
				}
			}}>
				<div style={{position: 'relative' }}>
					<FaComments className="icon" />
					{totalUnread > 0 && (
						<span className="menu-badge">{totalUnread}</span>
					)}
				</div>
				<span className="label">Chat</span>
			</div>
		</div>
	);
}