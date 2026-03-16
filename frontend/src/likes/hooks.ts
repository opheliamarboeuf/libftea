import { useState, useEffect } from "react";
import { likesApi } from "./api";
import { socket } from "../socket/socket";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";

export const useLike = (postId: number, authorId: number) => {
	const [liked, setLiked] = useState(false);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const { showModal } = useModal();
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
		if (user.id === authorId) {
			showModal("You can't like your own post if it is in a tournament");
			return ;
		}
		setLiked(prev => !prev);
		setCount(prev => liked ? prev - 1 : prev + 1);
		socket.emit("toggle_like", {
			postId,
			userId:user.id,
		});
	};

	return { liked, count, loading, toggleLike };
};