import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProfilePage = () => {
const { user, setUser } = useUser();

if (!user)
	return <Navigate to="/" replace />; // redirect if not logged in

return (
	<>
	<h1>Profile Page</h1>
	<p>Hi {user.username}</p>
	<div className="button1">
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
