import { Post } from "../../context/UserContext";

export function UserPostsList({ posts }: { posts: Post[] }) {
	if (!Array.isArray(posts))
		return null;

	return (
		<div className="posts-list">
		{posts.map(post => (
			<div key={post.id} className="post">
			<h3>{post.title}</h3>

			{post.caption && <p>{post.caption}</p>}

			<p>{new Date(post.createdAt).toLocaleString()} by {post.author.username}</p>
			</div>
		))}
		</div>
	);
}
