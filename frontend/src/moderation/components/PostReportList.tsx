import { Post } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

interface PostReportListProps {
	posts: Post[];
	// onPostReviewed?: () => void;
}

export function PostReportList( {posts}: PostReportListProps ) {
	if (!Array.isArray(posts)) return null;

	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	return (
	<div className="post-report-lists">
		<div className="post-report-list">
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
					{post.updatedAt && post.updatedAt !== post.createdAt
					? `edited ${new Date(post.updatedAt).toLocaleString()}`
					: `created ${new Date(post.createdAt).toLocaleString()}`}
				</span>
				</div>
			</div>
			</div>
		))}
		</div>
	</div>
	);
}