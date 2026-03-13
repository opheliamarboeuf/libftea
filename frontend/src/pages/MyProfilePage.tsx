import "../App.css";
import "./MyProfilePage.css";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { EditProfileModal, API_URL } from "../profile";
import { CreatePostModal } from "../posts/components/CreatePostModal";
import { Post } from "../context/UserContext";
import { fetchUserPosts } from "../posts/components/fetchUserPosts";
import { UserPostsList } from "../posts/components/UserPostsList";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
	const { user } = useUser();
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPostModal, setShowPostModal] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [showModal, setShowModal] = useState(false);
	const { t } = useTranslation();

	if (!user) return <Navigate to="/" replace />;

	const loadPosts = async () => {
		const data =  await fetchUserPosts(user.id);
		setPosts(data);
	}

	useEffect(() => {
		loadPosts();
	}, [user]);
	
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
						<span>Posts: {posts.length}</span>
						<span>{t('userprofile.friends')}{user.friends?.length ?? 0}</span>
						<span>{t('userprofile.posts')}</span>
					</div>
					<div className="bio">
						<p>{user.profile.bio || t('userprofile.writebio')}</p>
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
						<button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
							Edit Profile
						</button>
						<button className="edit-profile-btn" onClick={() => setShowModal(true)}>
							{t('editprofile.edit')}
						</button>
					</div>
					<div className="posts">
						<button className="expand-btn expand-btn-right" onClick={() => setShowPostModal(true)}>
							<span className="icon">＋</span>
  							<span className="expand-btn-text">Post an outfit</span>
						</button>
					<UserPostsList posts = {posts} onPostDeleted={loadPosts} />
					</div>
				</div>
			</div>
			{showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}
			{showPostModal && <CreatePostModal onPostCreated={loadPosts} onClose={() => setShowPostModal(false)} />}
		</div>
	);
};

export default ProfilePage;
