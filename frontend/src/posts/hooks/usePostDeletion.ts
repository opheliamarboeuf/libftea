import { useState } from "react";
import { mockDatabase } from "../../mockData";
import { useTranslation } from "react-i18next";

export function usePostDeletion() {
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { t } = useTranslation();
	
	const handlePostDeletion = async (postId: number): Promise<boolean> => {
		setIsDeleting(true);
		try {
			// Remove from mock database (will restore on refresh)
			const index = mockDatabase.posts.findIndex((p) => p.id === postId);
			if (index !== -1) mockDatabase.posts.splice(index, 1);
			setErrorMessage(null);
			return true;
		}
		catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			}
			else {
				setErrorMessage(t('registerpage.serverfail'));
			}
			return false;
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