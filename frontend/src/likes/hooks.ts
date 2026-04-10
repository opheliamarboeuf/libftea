import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useModal } from '../context/ModalContext';
import { Post } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { mockDatabase, createNotification } from '../mockData';

export const useLike = (post: Post) => {
	const [liked, setLiked] = useState(false);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const { showModal } = useModal();
	const { user } = useUser();
	const { t } = useTranslation();

	useEffect(() => {
		try {
			const allLikes = mockDatabase.likes.filter((l) => l.postId === post.id);
			setCount(allLikes.length);
			setLiked(allLikes.some((l) => l.userId === user?.id));
		} finally {
			setLoading(false);
		}
	}, [post.id, user?.id]);

	const toggleLike = () => {
		if (post.battleParticipants?.length && user.id === post.author.id) {
			showModal(t('errors.tournamentlike'));
			return;
		}

		if (!user) return;

		const existingLike = mockDatabase.likes.find(
			(l) => l.postId === post.id && l.userId === user.id,
		);

		if (existingLike) {
			const idx = mockDatabase.likes.indexOf(existingLike);
			if (idx > -1) mockDatabase.likes.splice(idx, 1);
			setLiked(false);
			setCount((prev) => prev - 1);
		} else {
			mockDatabase.likes.push({
				id: Math.max(0, ...mockDatabase.likes.map((l) => l.id)) + 1,
				userId: user.id,
				postId: post.id,
				createdAt: new Date(),
			});
			setLiked(true);
			setCount((prev) => prev + 1);

			// Notify post author (don't notify yourself)
			if (post.author.id !== user.id) {
				createNotification(post.author.id, 'LIKE', { username: user.username });
			}
		}
	};

	return { liked, count, loading, toggleLike };
};
