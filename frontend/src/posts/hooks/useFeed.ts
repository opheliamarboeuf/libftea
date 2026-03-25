import { useState, useEffect } from "react";
import { Post } from "../../context/UserContext";
import { postsApi } from "../api";
import i18n from "../../i18n";

type FeedType = "all" | "friends";

interface UseFeedResult {
	posts: Post[];
	loading: boolean;
	error: string | null;
	feedType: FeedType;
	setFeedType: (type: FeedType) => void;
	refresh: () => void;
}

export function useFeed(initialType: FeedType = "all"): UseFeedResult {
	const [feedType, setFeedType] = useState<FeedType>(initialType);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPosts = async () => {
		setLoading(true);
		setError(null);
		try {
			let data: Post[] = [];
			if (feedType === "all") {
				data = await postsApi.fetchAllUserPosts();
			}
			else if (feedType === "friends") {
				data = await postsApi.fetchFriendsPosts();
			}
			setPosts(data);
		}
		catch (err: any) {
			setError(err.message || i18n.t('errorpage.loadpost'));
		} finally {
			setLoading(false);
		}
	};
	// Refresh posts when feed type changes
	useEffect(() => {
		fetchPosts();
	}, [feedType]);

	// Manually refresh the feed
	const refresh = () => fetchPosts();

	return {
		posts, 
		loading, 
		error, 
		feedType,
		setFeedType, 
		refresh
	}
}
