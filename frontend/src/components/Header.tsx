import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import "./Header.css"
import "../App.css"

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const API_URL = "http://localhost:3000";
	const [showDropdown, setShowDropdown] = useState(false);

	if (!user) return null;

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
		setShowDropdown(false);
	}

	const toggleDropdown = () => {
		setShowDropdown(!showDropdown);
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
				<div className="avatar-menu">
					<div className="small-avatar" onClick={toggleDropdown}>
						<img
							src={user.profile.avatarUrl ? `${API_URL}${user.profile.avatarUrl}` : "/default-avatar.png"}
							alt="Small Avatar"
						/>
					</div>
					{showDropdown && (
						<div className="dropdown-menu">
							<button onClick={() => {
								navigate(`/profile/${user.id}`);
								setShowDropdown(false);
							}}>
								My Profile
							</button>
							<button onClick={() => {
								navigate('/settings');
								setShowDropdown(false);
							}}>
								Settings
							</button>
							<button onClick={handleLogout}>
								Log Out
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}