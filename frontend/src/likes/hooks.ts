import { useState, useEffect } from "react";
import { likesApi } from "./api";

export const useLike = (postId: number) => {
	const [liked, setLiked] = useState(false);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const fetchCount = async () => {
			try {
				const c = await likesApi.countLikes(postId);
				if (isMounted) setCount(c);
			} catch (err) {
				console.error(err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		fetchCount();
		return () => { isMounted = false };
	}, [postId]);

	const toggleLike = async () => {
		try {
			const result = await likesApi.toggleLike(postId);
			setLiked(result.liked);
			setCount(result.count);
		} catch (err) {
			console.error(err);
		}
	};

	return { liked, count, loading, toggleLike };
};