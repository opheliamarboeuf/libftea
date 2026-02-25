import { useState } from "react";
import { postsApi } from "../../api";

const MAX_TITLE_LENGTH = 50;
const MAX_CAPTION_LENGTH = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function usePostCreation() {
	const [title, setTitle] = useState("");
	const [caption, setCaption] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const validateImage = (file: File, type: string): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return `${type} must be JPEG, PNG, or WebP`;
		}
		if (file.size > MAX_FILE_SIZE) {
			return `${type} must be under 5MB`;
		}
		return null;
	};
	
		const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, "Post picture");
			if (error) {
				setErrorMessage(error);
				e.target.value = "";
				return;
			}
		}
		setImageFile(file);
		setErrorMessage(null);
	};

	const hasChanges = () => {
		return (
			title !== "") || 
			caption !== "" || 
			imageFile !== null;
	}

	const resetFields = () => {
		setTitle("");
		setCaption("");
		setImageFile(null);
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

		if (!imageFile) {
			setErrorMessage("Please select an image to upload");
			return false;
		}

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("image", imageFile);
			formData.append("title", title);
			formData.append("caption", caption);
			
			await postsApi.createPost(formData);
			setTitle("");
			setCaption("");	
			setImageFile(null);
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
		handleImageChange,
		handlePostCreation,
	}
}

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
