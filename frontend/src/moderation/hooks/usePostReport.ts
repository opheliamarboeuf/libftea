import { useState } from "react";
import { Post } from "../../context/UserContext";
import { moderationApi } from "../api";
import { CreateReportType, ReportCategory} from "../types";
import { useTranslation } from "react-i18next";

const MAX_DESCRIPTION_LENGTH = 150;

export function usePostReport(post: Post) {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<ReportCategory | null>(null);
	const { t } = useTranslation();

	const handlePostReport = async () => {
		setIsLoading(true);
		
		if (!category) {
			setErrorMessage(t('errors.selectcat'));
			setIsLoading(false);
			return false;
		}
	
		if (description.length > MAX_DESCRIPTION_LENGTH) {
			setErrorMessage(t('errors.deslength', { length: MAX_DESCRIPTION_LENGTH }));
			setIsLoading(false);
			return false;
		}

		try {
			const payload: CreateReportType = {
				category: category,
				description,
			};
			
			await moderationApi.reportPost(payload, post.id, );
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
				setErrorMessage(t('registerpage.serverfail'));
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
