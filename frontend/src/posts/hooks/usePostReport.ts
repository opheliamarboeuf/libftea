import { useState } from "react";
import { Post } from "../../context/UserContext";
import { postsApi } from "../api";
import { ReportPostType, ReportPostReasonType } from "../types";

const MAX_CONTEXT_LENGTH = 350;

export function usePostReport(post: Post, onPostReported: () => void) {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [context, setContext] = useState("");
	const [reason, setReason] = useState<ReportPostReasonType | null>(null);

	const handlePostReport = async () => {
		setIsLoading(true);
		
		if (!reason) {
			setErrorMessage("Please select a reason for reporting.");
			setIsLoading(false);
			return false;
		}
	
		if (context.length > MAX_CONTEXT_LENGTH) {
			setErrorMessage(`Title cannot exceed ${MAX_CONTEXT_LENGTH} characters`);
			setIsLoading(false);
			return false;
		}

		try {
			const payload: ReportPostType = {
				reason: reason,
				context,
			};
			
			await postsApi.reportPost(payload, post.id, );
			setContext("");
			setReason(null);
			setErrorMessage(null);
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
		setReason(null);
		setContext("");
		setIsLoading(false);
	}

	const hasChanges = () => {
		return (
			reason !==  null || 
			context !== ""
		)
	}
	return {
		context,
		setContext,
		MAX_CONTEXT_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostReport,
	}
}
