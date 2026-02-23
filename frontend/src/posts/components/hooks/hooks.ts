import { useState } from "react";
import { postsApi } from "../../api";
import { PostPayload } from "../../types";

const MAX_TITLE_LENGTH = 120;
const MAX_CAPTION_LENGTH = 500;

export function usePostCreation() {
	const [title, setTitle] = useState("");
	const [caption, setCaption] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const hasChanges = () => {
		return (
			title !== "") || 
			caption !== "";
	}

	const resetFields = () => {
		setTitle("");
		setCaption("");
		setErrorMessage(null);
	}

	const handlePostCreation = async (): Promise<boolean> => {
		if (title === ""){
			setErrorMessage("Please enter a title");
			return (false);
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setErrorMessage(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
			return false;
		}

		if (caption.length > MAX_CAPTION_LENGTH) {
			setErrorMessage(`Caption cannot exceed ${MAX_CAPTION_LENGTH} characters`);
			return false;
		}

		setIsLoading(true);
		const payload: PostPayload = {title, caption}; 
		try {
			await postsApi.createPost(payload);
			setTitle("");
			setCaption("");	
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
		}
		finally {
			setIsLoading(false);
		}
	}
	return {
		title, 
		setTitle,
		caption,
		setCaption,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		MAX_TITLE_LENGTH,
		MAX_CAPTION_LENGTH,
		handlePostCreation,
	}
}