import "./userPostsList.css";
import { Post, useUser } from "../../context/UserContext";
import { API_URL } from "../../profile";
import { FaArrowUp, FaArrowDown, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { usePostDeletion } from "./hooks/hooks";
import { useModal } from "../../context/ModalContext";

export function UserPostsList({ posts }: { posts: Post[] }) {
	if (!Array.isArray(posts)) return null;
    
	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	}
	
	const {
		errorMessage,
		isDeleting,
		handlePostDeletion,
	} = usePostDeletion();

	const { user, setUser } = useUser();
	const { showModal } = useModal();

	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  	
	// Detect clicks outside of the  menu
	const menuRef = useRef<HTMLDivElement>(null);

	// Function called whenever the user clicks anywhere on the page
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// If the menu exists and the clicked element is NOT inside the menu
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				// Close the menu
				setOpenMenuId(null);
			}
		};
		// Add an event listener for mouse clicks
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Cleanup function: remove the event listener when component unmounts
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);


	const toggleMenu = (postId: number) => {
		setOpenMenuId(openMenuId === postId ? null : postId);
	};

	const handleEdit = (postId: number) => {
		console.log("Edit post", postId);
		setOpenMenuId(null);
	};

	const handleDelete = async (postId: number) => {
		const success = await handlePostDeletion(postId);
		if (success && user){
			// Create a new table without the deleted post
			const updatePosts = user.posts.filter(p => p.id !== postId);
			setUser({
				...user, 
				posts: updatePosts,
			})
			setOpenMenuId(null);
		}
		else {
			showModal(errorMessage);
		}
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
			<div className="post-menu" ref={openMenuId === post.id ? menuRef : null} >
				<FaEllipsisV onClick={() => toggleMenu(post.id)} />
				{openMenuId === post.id && (
					<div className="menu-dropdown">
						{post.author.id === user.id ? (
							<>
								<button onClick={() => handleEdit(post.id)}>Edit</button>
								<button onClick={() => handleDelete(post.id)}>Delete</button>
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
			<button><FaArrowUp /></button>
			<button><FaArrowDown /></button>
			</div>
			<div className="counters">
			<span className="count">0 Upvotes </span>
			</div>
		</div>
		</div>
	))}
	</div>
	);
};