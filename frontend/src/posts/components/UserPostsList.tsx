import "./UserPostsList.css";
import { Post, useUser } from "../../context/UserContext";
import { API_URL } from "../../profile";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePostMenu } from "../hooks/usePostMenu";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { UserNameWithRole } from "../../common/components/UserNameWithRole";
import { EditPostModal } from "./EditPostModal";
import { LikeButton } from "../../likes/LikeButton";
import { CommentSection } from "../../comments/CommentSection";
import { useState, useEffect } from "react";
import { ReportPostModal } from "../../moderation/components/reports/posts/ReportPostModal";
import { useTranslation } from "react-i18next";

interface UserPostsListProps {
	posts: Post[];
	onPostDeleted?: () => void;
}

export function UserPostsList({ posts, onPostDeleted }: UserPostsListProps) {
	if (!Array.isArray(posts)) return null;
	
	const navigate = useNavigate();
	const { user } = useUser();
	const { t } = useTranslation();
	const [postToReport, setPostToReport] = useState<Post | null>(null);
	const [visiblePosts, setVisiblePosts] = useState<Post[]>(posts);

	// Synchronise visiblePosts if posts change
	useEffect(() => {
		setVisiblePosts(posts);
	}, [posts]);

	const {
		openMenuId,
		isDeleting,
		menuRef,
		showConfirm,
		toggleMenu,
		handleEdit,
		confirmDelete,
		cancelDelete,
		setPostToDelete,
		postToEdit,
		closeModal,
	} = usePostMenu(onPostDeleted);

	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	// Fonction to hide reported posts
	const handlePostReported = (reportedPostId: number) => {
		setVisiblePosts((prev) => prev.filter((p) => p.id !== reportedPostId));
		setPostToReport(null);
	};

	return (
		<div className="posts-list">
		{visiblePosts.map((post) => (
		<div key={post.id} className="post-card">
		<div className="post-header">
			<div className="post-title-row">
				<h3 className="post-title">{post.title}</h3>
				<div className="post-header-right">
				{(post as any).battleParticipants?.[0]?.Battle?.theme && (
					<p className="post-tournament-theme">
					🏆 {(post as any).battleParticipants[0].Battle.theme}
					</p>
				)}
				{(post as any).isWinner && (
					<div className="winner-container">
					<h3 className="winner-badge">{t('tournament.lastweek')} 💅🏼</h3>
					</div>
				)}
				</div>
			</div>
			<div className="post-meta">
			<span
				className="post-author"
				onClick={() => goToProfile(post.author.id)}
			>
				<UserNameWithRole username={post.author.username} role={(post.author as any).role} />,
			</span>
			<span className="post-date">
			{
				post.updatedAt && post.updatedAt !== post.createdAt
				? t('post.edited', { date: new Date(post.updatedAt).toLocaleString() })
				: t('post.created', { date: new Date(post.createdAt).toLocaleString() })
			}
			</span>
			</div>
			{/* Post menu */}
			<div className="post-menu" ref={openMenuId === post.id ? menuRef : null} >
				<FaEllipsisV onClick={() => toggleMenu(post.id)} />
				{openMenuId === post.id && (
					<div className="menu-dropdown">
					{/* Everyone can report except the owner of the post*/}
					{post.author.id !== user.id && (
						<button onClick={() => { setPostToReport(post); toggleMenu(post.id); }}>
						{t('post.report')}
						</button>
					)}

					{/* Edit if owner */}
					{post.author.id === user.id && (
						<button onClick={() => handleEdit(post)}>{t('post.editpost')}</button>
					)}

					{/* Delete if owner of admin or mod */}
					{(post.author.id === user.id || user.role === "ADMIN" || user.role === "MOD") && (
						<button 
						onClick={() => setPostToDelete(post.id)}
						disabled={isDeleting}
						>
						{isDeleting ? t('friends.deleting') : t('friends.delete')}
						</button>
					)}
					</div>
				)}
			</div>
		</div>
		{/* Image + comments row */}
		<div className="post-content">
			<div className="post-image">
			<img src={`${API_URL}${post.imageUrl}`} alt="Post" />
			</div>
			<div className="post-text">
			<CommentSection postId={post.id} />
			</div>
		</div>
		{/* Caption */}
		{post.caption && (
			<div className="post-caption">
			<p>{post.caption}</p>
			</div>
		)}
		<div className="post-footer">
			<div className="interactions">
				<LikeButton post={post} />
			</div>
		</div>
		</div>
	))}
		{postToReport && (
			<ReportPostModal
				post={postToReport}
				onPostReported={() => handlePostReported(postToReport.id)}
				onClose={() => setPostToReport(null)}
			/>
		)}
		{postToEdit && (
			<EditPostModal 
				post={postToEdit} 
				onPostEdited={onPostDeleted} 
				onClose={closeModal}
			/>
		)}
		{showConfirm && (
			<ConfirmDialog
				message={t('post.confirmdelete')}
				onConfirm={confirmDelete}
				onCancel={cancelDelete}
			/>
			)}
	</div>
	);
};
