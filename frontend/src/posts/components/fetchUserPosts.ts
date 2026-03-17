import { postsApi } from "../api";
import { Post } from "../../context/UserContext";
import { profileApi } from "../../profile/api";

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

export async function fetchUserTournamentPosts(userId: number) {
	try
	{
		return await profileApi.getUserTournamentPosts(userId);
	}
	catch (error)
	{
		console.error("Failed to fetch posts:", error);
		return [];
	}
};
