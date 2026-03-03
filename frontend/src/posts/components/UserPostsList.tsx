import "./UserPostsList.css";
import { Post, useUser } from "../../context/UserContext";
import { API_URL } from "../../profile";
import { FaHeart, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePostMenu } from "../hooks/usePostMenu";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { EditPostModal } from "./EditPostModal";

interface UserPostsListProps {
	posts: Post[];
	onPostDeleted?: () => void;
}

export function UserPostsList({ posts, onPostDeleted }: UserPostsListProps) {
	if (!Array.isArray(posts)) return null;
    
	const navigate = useNavigate();
	const { user } = useUser();
	
	const {
		openMenuId,
		isDeleting,
		menuRef,
		showConfirm,
		toggleMenu,
		handleEdit,
		confirmDelete,
		cancelDelete,
		handleReport,
		setPostToDelete,
		postToEdit,
		closeModal,
	} = usePostMenu(onPostDeleted);

	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	return (
	<div className="posts-list">
	{posts.map((post) => (
		<div key={post.id} className="post-card">
		
		<div className="post-header">
			<h3 className="post-title">{post.title}</h3>
			<div className="post-meta">
			<span
				className="post-author"
				onClick={() => goToProfile(post.author.id)}
			>
				{post.author.username},
			</span>
			<span className="post-date">
			{
				post.updatedAt && post.updatedAt !== post.createdAt
				? `edited ${new Date(post.updatedAt).toLocaleString()}`
				: `created ${new Date(post.createdAt).toLocaleString()}`
			}
			</span>
			</div>
			{/* Post menu */}
			<div className="post-menu" ref={openMenuId === post.id ? menuRef : null} >
				<FaEllipsisV onClick={() => toggleMenu(post.id)} />
				{openMenuId === post.id && (
					<div className="menu-dropdown">
						{post.author.id === user.id || user.role === "ADMIN" || user.role === "MOD" ? (
							<>
								{/* Edit only if owner */}
								{post.author.id === user.id && <button onClick={() => handleEdit(post)}>Edit</button>}
								{/* Delete if owner or admin/mod */}
								<button 
									onClick={() => setPostToDelete(post.id)}
									disabled={isDeleting}
								>
									{isDeleting? "Deleting..." : "Delete"}
								</button>
							</>
						) : (
							<button onClick={() => handleReport(post.id)}>Report</button>
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
			<div className="post-comments">Comments placeholder</div>
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
			<button><FaHeart /></button>
			</div>
			<div className="counters">
			<span className="count">0 Likes </span>
			</div>
		</div>
		</div>
	))}
		{postToEdit && (
			<EditPostModal 
				post={postToEdit} 
				onPostEdited={onPostDeleted} 
				onClose={closeModal}
			/>
		)}
		{showConfirm && (
			<ConfirmDialog
				message="Are you sure you want to delete your post?"
				onConfirm={confirmDelete}
				onCancel={cancelDelete}
			/>
			)}
	</div>
	);
};
