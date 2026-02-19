import { postsApi } from "../api";
import { Post } from "../../context/UserContext";

export const fetchUserPosts = async (userId: number): Promise<Post[]> => {
	try {
		const posts = await postsApi.fetchUserPosts(userId);
		if (!posts || posts.length === 0) {
			console.warn("No posts found");
			return [];
		}
		return posts;
	}
	catch (error) {
		console.error("Failed to fetch posts:", error);
		return [];
	}
};
