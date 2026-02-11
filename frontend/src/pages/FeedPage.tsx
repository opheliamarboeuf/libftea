import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {

	const { user, setUser } = useUser();
	const navigate = useNavigate();

	return (
		<>
		<h1>
		{user.profile.displayName
			? `${user.profile.displayName}'s Home Page`
			: `${user.username}'s Home Page`}
		</h1>
		<div className="button1">
			<button
			onClick={() => {
				navigate("/profile");
			}}
			>
			My profile
			</button>
			<button
			onClick={() => {
				localStorage.removeItem("token");
				setUser(null); // logout
			}}
			>
			Logout
			</button>
		</div>
		</>
		
	)
};

export default HomePage;

