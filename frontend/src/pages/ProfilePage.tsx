import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
	const { user, setUser } = useUser();
	const navigate = useNavigate();

	if (!user)
		return <Navigate to="/" replace />; // redirect if not logged in

	return (
		<>
		<h1>{user.username}'s Profile Page</h1>
		<div className="button1">
			<button
			onClick={() => {
				navigate("/home");
			}}
			>
			My Feed
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
	);
};

export default ProfilePage;
