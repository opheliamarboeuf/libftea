import "../App.css";
import "./MyProfilePage.css";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import { EditProfileModal, API_URL } from "../profile";

const ProfilePage = () => {
	const { user } = useUser();
	const [showModal, setShowModal] = useState(false);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="profile-page">
			{/* MAIN CONTENT */}
			<div className="main-content">
				{/* PROFILE INFO COLUMN */}
				<div className="profile-info">
					<div className="profile-pic">
						<img
							src={
								user.profile.avatarUrl
									? `${API_URL}${user.profile.avatarUrl}`
									: "/assets/images/default-avatar.jpeg"
							}
							alt="Profile Avatar"
						/>
					</div>
					<h2 className="display-name">{user.profile.displayName || user.username}</h2>
					<div className="stats">
						<span>Friends: {user.friends?.length ?? 0}</span>
						<span>Posts: 5</span>
					</div>
					<div className="bio">
						<p>{user.profile.bio || "Write your bio here..."}</p>
					</div>
				</div>

				{/* COVER AND POSTS */}
				<div className="cover-and-posts">
					<div className="cover">
						<img
							src={
								user.profile.coverUrl
									? `${API_URL}${user.profile.coverUrl}`
									: "/assets/images/default-cover.jpeg"
							}
							alt="Cover"
						/>
						<button className="edit-profile-btn" onClick={() => setShowModal(true)}>
							Edit Profile
						</button>
					</div>
					<div className="posts">
						<p>Post 1</p>
						<p>Post 2</p>
						<p>Post 3</p>
					</div>
				</div>
			</div>

			{showModal && <EditProfileModal onClose={() => setShowModal(false)} />}
		</div>
	);
};

export default ProfilePage;
