import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { SearchBar } from "./SearchBar";

export const Header = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUser();

	if (!user) return null;

	return (
		<header style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '15px, 30px',
			backgroundColor: '#f8f9fa',
			borderBottom: '1px solid #dee2e6',
		}}>
			<div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
				<h2 style={{ margin: 0, cursor: 'pointer', }} onClick={() => navigate('/home')}>
					Libftea
				</h2>
				<SearchBar />
			</div>

			<div style={{ display: 'flex', gap: '10px'}}>
				<button onClick={() => navigate('/home')}>Feed</button>
				<button onClick={() => navigate('/friends')}>Amis</button>
				<button onClick={() => navigate('/profile')}>Profil</button>
				<button onClick={() => {
					localStorage.removeItem('token');
					setUser(null);
					navigate('/login');
				}}>
					Deconnexion
				</button>
			</div>
		</header>
	);
};