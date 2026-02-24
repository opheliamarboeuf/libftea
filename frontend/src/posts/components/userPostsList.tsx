import { Post, useUser } from "../../context/UserContext";
import { API_URL } from "../../profile";
import "./userPostsList.css";
import { FaArrowUp, FaArrowDown, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function UserPostsList({ posts }: { posts: Post[] }) {
	if (!Array.isArray(posts)) return null;
    
	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	}
	
	const { user } = useUser();

	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	const toggleMenu = (postId: number) => {
		setOpenMenuId(openMenuId === postId ? null : postId);
	};

	const handleEdit = (postId: number) => {
		console.log("Edit post", postId);
		setOpenMenuId(null);
	};

	const handleDelete = (postId: number) => {
		console.log("Delete post", postId);
		setOpenMenuId(null);
	};

		const handleReport = (postId: number) => {
			console.log("Report post", postId);
		setOpenMenuId(null);
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
				{post.author.username}
			</span>
			<span className="post-date">
				{new Date(post.createdAt).toLocaleString()}
			</span>
			</div>

			{/* Post menu */}
			<div className="post-menu">
				<FaEllipsisV onClick={() => toggleMenu(post.id)} />
				{openMenuId === post.id && (
					<div className="menu-dropdown">
						{post.author.id === user.id ? (
							<>
								<button onClick={() => handleEdit(post.id)}>Edit post</button>
								<button onClick={() => handleDelete(post.id)}>Delete post</button>
							</>
						) : (
							<button onClick={() => handleReport(post.id)}>Report post</button>
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
			<button><FaArrowUp /></button>
			<button><FaArrowDown /></button>
			</div>
			<div className="counters">
			<span className="count">0 Upvotes </span>
			<span className="count">0 Downvotes</span>
			</div>
		</div>
		</div>
	))}
	</div>
	);
};