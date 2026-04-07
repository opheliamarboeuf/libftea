import { useState, useEffect } from 'react';
import { Post, useUser } from '../../context/UserContext';
import { mockDatabase } from '../../mockData';
import { fetchUserPosts } from '../../mockData/mockUser';

type FeedType = 'all' | 'friends';

interface UseFeedResult {
	posts: Post[];
	loading: boolean;
	error: string | null;
	feedType: FeedType;
	setFeedType: (type: FeedType) => void;
	refresh: () => void;
}

export function useFeed(initialType: FeedType = 'all'): UseFeedResult {
	const [feedType, setFeedType] = useState<FeedType>(initialType);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error] = useState<string | null>(null);
	const { user } = useUser();

	const fetchPosts = async () => {
		setLoading(true);
		try {
			if (feedType === 'all') {
				const tournamentPostIds = new Set(
					mockDatabase.battleParticipants.map((bp) => bp.postId),
				);
				const allPosts = await Promise.all(
					mockDatabase.users.map((u) => fetchUserPosts(u.id)),
				);
				const flat = allPosts
					.flat()
					.filter((p) => !tournamentPostIds.has(p.id))
					.sort(
						(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					);
				setPosts(flat);
			} else if (feedType === 'friends') {
				if (!user) {
					setPosts([]);
					return;
				}
				const friendIds = mockDatabase.friendships
					.filter(
						(f) =>
							(f.requesterId === user.id || f.addresseId === user.id) &&
							f.status === 'ACCEPTED',
					)
					.map((f) => (f.requesterId === user.id ? f.addresseId : f.requesterId));
				const friendPosts = await Promise.all(friendIds.map((id) => fetchUserPosts(id)));
				const flat = friendPosts
					.flat()
					.sort(
						(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					);
				setPosts(flat);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, [feedType, user]);

	const refresh = () => fetchPosts();

	return { posts, loading, error, feedType, setFeedType, refresh };
}
