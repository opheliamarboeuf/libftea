import "../App.css";
import "./MyProfilePage.css";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { EditProfileModal, API_URL } from "../profile";
import { CreatePostModal } from "../posts/components/CreatePostModal";
import { Post } from "../context/UserContext";
import { fetchUserPosts, fetchUserTournamentPosts } from "../posts/components/fetchUserPosts";
import { UserPostsList } from "../posts/components/UserPostsList";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
	const { user } = useUser();
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPostModal, setShowPostModal] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [profileTab, setProfileTab] = useState("posts");
	const [tournamentPosts, setTournamentPosts] = useState<Post[]>([])
	const { t } = useTranslation();

	if (!user) return <Navigate to="/" replace />;

	const loadPosts = async () => {
		const data =  await fetchUserPosts(user.id);
		setPosts(data);
	}

	const loadTournamentPosts = async () => {
		const data = await fetchUserTournamentPosts(user.id);
		setTournamentPosts(data);
	}

	useEffect(() => {
		loadPosts();
		loadTournamentPosts();
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
						<span>{t('userprofile.friends')}{user.friends?.length ?? 0}</span>
						<span>{t('userprofile.posts')}{posts.length}</span>
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
							{t('editprofile.edit')}
						</button>
					</div>
					<div className="posts">
						<div className="posts-toolbar">
							<div className="profile-tabs">
								<div className={`profile-tab-indicator ${profileTab}`} />
								<button
									className={profileTab === "posts" ? "active" : ""}
									onClick={() => setProfileTab("posts")}
								>
									Posts
								</button>
								<button
									className={profileTab === "tournament" ? "active" : ""}
									onClick={() => setProfileTab("tournament")}
								>
									Tournament
								</button>
							</div>
							{profileTab === "posts" && (
								<button className="expand-btn expand-btn-post" onClick={() => setShowPostModal(true)}>
									<span className="icon">＋</span>
									<span className="expand-btn-text">Post an outfit</span>
								</button>
							)}
							</div>
							{profileTab === "posts" && (
								<UserPostsList posts = {posts} onPostDeleted={loadPosts} />
							)}
						{profileTab === "tournament" && (
							<UserPostsList posts={tournamentPosts} onPostDeleted={loadTournamentPosts} />
						)}
						<button className="expand-btn expand-btn-right" onClick={() => setShowPostModal(true)}>
							<span className="icon">＋</span>
  							<span className="expand-btn-text">{t('feedpage.postoutfit')}</span>
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
