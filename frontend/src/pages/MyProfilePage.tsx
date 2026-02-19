import "../App.css";
import "./MyProfilePage.css";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { EditProfileModal, API_URL } from "../profile";
import { CreatePostButton } from "../posts/components/createPostButton";
import { Post } from "../context/UserContext";
import { fetchUserPosts } from "../posts/components/fetchUserPosts";
import { UserPostsList } from "../posts/components/userPostsList";

const ProfilePage = () => {
	const { user } = useUser();
	const [showModal, setShowModal] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);

	if (!user) return <Navigate to="/" replace />;

	const loadPosts = async () => {
		const data =  await fetchUserPosts(user.id);
		setPosts(data);
	}

	useEffect(() => {
		loadPosts();
	}, []);
	
	return (
		<div className="profile-page">
			{/* MAIN CONTENT */}
			<div className="main-content">
				{/* PROFILE INFO COLUMN */}
				<div className="profile-info">
					<p className="display-name">
						{user.profile.displayName ? user.profile.displayName : '\u00A0'} {/*space to keep the height*/}
					</p>
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
					<p className="display-username">{user.username}</p>
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
						<CreatePostButton onPostCreated={loadPosts}/>
						<UserPostsList posts = {posts} />
					</div>
				</div>
			</div>

			{showModal && <EditProfileModal onClose={() => setShowModal(false)} />}
		</div>
	);
};

export default ProfilePage;
