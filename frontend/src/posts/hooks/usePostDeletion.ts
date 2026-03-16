import { useState } from "react";
import { postsApi } from "../api";

export function usePostDeletion() {
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	
	const handlePostDeletion = async (postId: number): Promise<boolean> => {

		setIsDeleting(true);
		try {
			await postsApi.deletePost(postId);
			setErrorMessage(null);
			return true;
		}
		catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			}
			else {
				setErrorMessage("Server unreachable");
			}
			return false
		}
		finally{
			setIsDeleting(false);
		}
	}
	return {
		errorMessage,
		isDeleting,
		handlePostDeletion,
	}
}