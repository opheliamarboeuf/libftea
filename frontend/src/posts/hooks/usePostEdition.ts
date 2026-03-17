import { useState } from "react";
import { Post, useUser } from "../../context/UserContext";
import { postsApi } from "../api";
import { PostEditPayload } from "../types";

const MAX_TITLE_LENGTH = 50;
const MAX_CAPTION_LENGTH = 500;

export function usePostEdition(post: Post, onPostEdited: () => void) {
	const { user, setUser } = useUser();
	
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [title, setTitle] = useState(post.title);
	const [caption, setCaption] = useState(post.caption || "");

	const handlePostEdition = async () => {
		setIsLoading(true);
		
		if (title === "") {
			setErrorMessage("Please enter a title");
			setIsLoading(false);
			return (false);
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setErrorMessage(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
			setIsLoading(false);
			return false;
		}

		if (caption.length > MAX_CAPTION_LENGTH) {
			setErrorMessage(`Caption cannot exceed ${MAX_CAPTION_LENGTH} characters`);
			setIsLoading(false);
			return false;
		}

		try {
			const payload: PostEditPayload = {
				title,
				caption,
			};
			
			const updatedPost = await postsApi.updatePost(post.id, payload);
			setTitle(updatedPost.title);
			setCaption(updatedPost.caption || "");
			setErrorMessage(null);
			
			// Update the user context with the new post
			if (user) {
				const updatedPosts = user.posts.map(p => 
					p.id === post.id ? updatedPost : p
				);
				setUser({
					...user,
					posts: updatedPosts,
				});
			}
			
			return updatedPost;
		}
		catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			}
			else {
				setErrorMessage("Server unreachable");
			}
		}
		finally { 
			setIsLoading(false);
		}
	}

	const resetFields = () => {
		setTitle(post.title);
		setCaption(post.caption || "");
		setIsLoading(false);
	}

	const hasChanges = () => {
		return (
			title !== post.title || 
			caption !== post.caption
		)
	}
	return {
		title,
		setTitle,
		caption,
		setCaption,
		MAX_TITLE_LENGTH,
		MAX_CAPTION_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostEdition,
	}
}
