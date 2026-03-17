import "./FeedPage.css"
import "../App.css"
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { UserPostsList } from "../posts/components/UserPostsList";
import { useFeed } from "../posts/hooks/useFeed";
import { CreatePostModal } from "../posts/components/CreatePostModal";
import { useTranslation } from "react-i18next";

const FeedPage = () => {

	const { user } = useUser();
	const { posts, error, feedType, setFeedType, refresh } = useFeed("all");
	const [showPostModal, setShowPostModal] = useState(false);
	const { t } = useTranslation();

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="feed-page">
				<div className="feed-header">
					<div className="page-name">{t('feedpage.myfeed')}</div>
					<div className="feed-center">
						<button className="expand-btn expand-btn-left" onClick={() => setShowPostModal(true)}>
							<span className="icon">＋</span>
							<span className="expand-btn-text">{t('feedpage.postoutfit')}</span>
						</button>
					<div className="feed-tabs">
						<div
							className={`tab-indicator ${feedType === "friends" ? "right" : ""}`}
						/>
						<button className={feedType === "all" ? "active" : ""} onClick={() => setFeedType("all")}>{t('feedpage.discover')}</button>
						<button className={feedType === "friends" ? "active" : ""} onClick={() => setFeedType("friends")}>{t('feedpage.friends')}</button>
					</div>
				</div>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}
			{posts.length === 0 ? (
				<p className="no-posts-message">{t('feedpage.noposts')}</p>
				) : (
				<UserPostsList posts={posts} onPostDeleted={refresh} />
				)}
			{showPostModal && <CreatePostModal onPostCreated={refresh} onClose={() => setShowPostModal(false)} />}
		</div>
	);
};

export default FeedPage;

