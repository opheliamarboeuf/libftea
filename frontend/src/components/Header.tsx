import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { SearchBar } from "./SearchBar";
import "./Header.css"
import "../App.css"

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUser();

	if (!user)	return null;

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
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
				<button className="regular-button" onClick = {handleLogout}>Log Out</button>
			</div>
		</header>
	);
}