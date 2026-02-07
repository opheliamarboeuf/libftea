import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, ChangeEvent } from "react";

const ProfilePage = () => {
	const { user, setUser } = useUser();
	const navigate = useNavigate();

	if (!user)
		return <Navigate to="/" replace />; // redirect if not logged in

	const [bio, setbio] = useState(user.profile.bio);
	const [avatarUrl, setavatarUrl] = useState(user.profile.avatarUrl);
	const [coverUrl, setcoverUrl] = useState(user.profile.coverUrl);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleBioChange = (e: ChangeEvent<HTMLInputElement>) => {
		setbio(e.target.value);
	};
	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
		setavatarUrl(e.target.value);
	};
	const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
		setcoverUrl(e.target.value);
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null);

		const userData = { bio, avatarUrl, coverUrl };

		try {
			const res = await fetch("http://localhost:3000/profile/edit", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userData),
			});

			const data = await res.json();

			if (!res.ok) {
				if (Array.isArray(data.message)) setErrorMessage(data.message[0]);
				else setErrorMessage(data.message || "Profile edit Failed");
				return;
			}

			// Update user context by creating a new object: 
			// if prevUser exists, keep all user fields, replace the profile object 
			// with a copy that updates bio, avatarUrl, and coverUrl; 
			// if prevUser is null, do nothing
			setUser((prevUser) =>
					prevUser
					? {
						...prevUser,
						profile: {
						...prevUser.profile,
						bio: data.bio,
						avatarUrl: data.avatarUrl,
						coverUrl: data.coverUrl,
					},
				}
				: prevUser
			);
		} catch (error) {
			console.log("Server unreachable");
		}
	};

	return (
		<>
			<h1>{user.username}'s Profile Page</h1>
			<div className="profile">
			<div className="cover">
				<p>Cover URL: {user.profile.coverUrl}</p>
				<img src={user.profile.coverUrl} alt="Cover" />
			</div>

			<div className="avatar">
				<p>Avatar URL: {user.profile.avatarUrl}</p>
				<img src={user.profile.avatarUrl} alt="Avatar" />
			</div>

			<div className="bio">
				<p>Bio: {user.profile.bio}</p>
			</div>
			</div>
			<div className="button1">
				<button onClick={() => navigate("/home")}>My Feed</button>
				<button
					onClick={() => {
						localStorage.removeItem("token");
						setUser(null); // logout
					}}
				>
					Logout
				</button>
			</div>

			{errorMessage && <p className="error">{errorMessage}</p>}
		</>
	);
};

export default ProfilePage;
