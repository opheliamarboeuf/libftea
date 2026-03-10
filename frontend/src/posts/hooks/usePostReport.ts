import { useState } from "react";
import { Post } from "../../context/UserContext";
import { postsApi } from "../api";
import { ReportPostType, ReportPostCategoryType } from "../types";

const MAX_DESCRIPTION_LENGTH = 250;

export function usePostReport(post: Post) {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<ReportPostCategoryType | null>(null);

	const handlePostReport = async () => {
		setIsLoading(true);
		
		if (!category) {
			setErrorMessage("Please select a category");
			setIsLoading(false);
			return false;
		}
	
		if (description.length > MAX_DESCRIPTION_LENGTH) {
			setErrorMessage(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
			setIsLoading(false);
			return false;
		}

		try {
			const payload: ReportPostType = {
				category: category,
				description,
			};
			
			await postsApi.reportPost(payload, post.id, );
			setDescription("");
			setCategory(null);
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

	const resetFields = () => {
		setCategory(null);
		setDescription("");
		setIsLoading(false);
	}

	const hasChanges = () => {
		return (
			category !==  null || 
			description !== ""
		)
	}
	return {
		category,
		setCategory,
		description,
		setDescription,
		MAX_DESCRIPTION_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostReport,
	}
}
