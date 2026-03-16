import { likesApi } from "./api";
import { useLike } from "./hooks";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { Post } from "../context/UserContext";

interface Props {
    post: Post,
}

export function LikeButton({ post }: Props) {
	const { liked, count, loading, toggleLike } = useLike(post);
    const [btnLoading, setBtnLoading] = useState(false);

	const handleClick = () => {
		setBtnLoading(true);
		try {
			toggleLike();
		} catch (err) {
			console.error(err);
		} finally {
			setBtnLoading(false);
		}
	}

	return (
		<>
			<button
				className={liked ? "liked" : "" }
				onClick={handleClick}
				disabled={btnLoading}
			>
				<FaHeart className="heart-icon" />
				<span className="count">
					{count ?? 0} {count <= 1 ? "like" : "likes"}
				</span>
			</button>
		</>
	);
}