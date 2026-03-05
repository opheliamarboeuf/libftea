import { useState, useEffect } from "react";
import { likesApi } from "./api";
import { socket } from "../socket/socket";
import { useUser } from "../context/UserContext";

export const useLike = (postId: number) => {
	const [liked, setLiked] = useState(false);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	useEffect(() => {
		let isMounted = true;
		const fetchData = async () => {
			try {
				const [c, status] = await Promise.all([
					likesApi.countLikes(postId),
					likesApi.isLiked(postId),
				]);

				if (isMounted) {
					setCount(c);
					setLiked(status.liked);
				}
			} catch (err) {
				console.error(err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		fetchData();
		return () => { isMounted = false };
	}, [postId]);

	useEffect(() => {
		const handleLikeUpdate = (data: any) => {
			if (data.postId === postId) {
				setCount(data.count);
			}
		};
		socket.on("like_updated", handleLikeUpdate);

		return () => {
			socket.off("like_updated", handleLikeUpdate);
		}
	}, [postId]);

	const toggleLike = () => {
		socket.emit("toggle_like", {
			postId,
			userId:user.id,
		});
	};
	// const toggleLike = async () => {
	// 	setLiked(prev => !prev);
	// 	setCount(prev => liked ? prev - 1 : prev + 1);
	// 	try {
	// 		const result = await likesApi.toggleLike(postId);
	// 		setLiked(result.liked);
	// 		setCount(result.count);
	// 	} catch (err) {
	// 		console.error(err);
	// 		setLiked(prev => !prev);
	// 		setCount(prev => liked ? prev + 1 : prev - 1);
	// 	}
	// };

	return { liked, count, loading, toggleLike };
};