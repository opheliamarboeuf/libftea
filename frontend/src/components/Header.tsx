import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { SearchBar } from "./SearchBar";
import "./Header.css"
import "../App.css"

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const API_URL = "http://localhost:3000";

	if (!user) return null;

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
		navigate('/')
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
					<div className="small-avatar">
						<img
							src={user.profile.avatarUrl ? `${API_URL}${user.profile.avatarUrl}` : "/default-avatar.png"}
							alt="Small Avatar"
						/>
					</div>
					<div className="dropdown-menu">
						<button onClick={() => navigate(`/profile`)}>
							<span className="label">My Profile</span>
						</button>
						<button onClick={() => navigate('/settings')}>
							<span className="label">Settings</span>
						</button>
						<button onClick={handleLogout}>
							<span className="label">Log Out</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}