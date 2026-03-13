import "./FeedPage.css"
import "../App.css"
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { UserPostsList } from "../posts/components/UserPostsList";
import { useFeed } from "../posts/components/hooks/useFeed";
import { CreatePostModal } from "../posts/components/CreatePostModal";

const FeedPage = () => {

	const { user } = useUser();
	const { posts, error, feedType, setFeedType, refresh } = useFeed("all");
	const [showPostModal, setShowPostModal] = useState(false);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="feed-page">
				<div className="feed-header">
					<div className="page-name">My feed</div>
					<div className="feed-center">
						<button className="expand-btn expand-btn-left" onClick={() => setShowPostModal(true)}>
							<span className="icon">＋</span>
							<span className="expand-btn-text">Post an outfit</span>
						</button>
					<div className="feed-tabs">
						<div
							className={`tab-indicator ${feedType === "friends" ? "right" : ""}`}
						/>
						<button className={feedType === "all" ? "active" : ""} onClick={() => setFeedType("all")}>Discover</button>
						<button className={feedType === "friends" ? "active" : ""} onClick={() => setFeedType("friends")}>Friends</button>
					</div>
				</div>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}
			{posts.length === 0 ? (
				<p className="no-posts-message">No posts to display</p>
				) : (
				<UserPostsList posts={posts} onPostDeleted={refresh} />
				)}
			{showPostModal && <CreatePostModal onPostCreated={refresh} onClose={() => setShowPostModal(false)} />}
		</div>
	);
};

export default FeedPage;
