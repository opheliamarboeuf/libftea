import { likesApi } from "./api";
import { useLike } from "./hooks";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";

interface Props {
    postId: number;
}

export function LikeButton({ postId }: Props) {
	const { liked, count, loading, toggleLike } = useLike(postId);
    const [btnLoading, setBtnLoading] = useState(false);

	console.log("COUNT =", count);

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