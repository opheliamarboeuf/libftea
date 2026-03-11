import { useState } from "react";
import { moderationApi } from "../api";
import { ReportHandlePayload } from "../types";

const MAX_MOD_MESSAGE_LENGTH = 200;

export function useHandleReport(reportId: number) {

	const [mod_message, setMod_message] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const rejectReport = async () => {
		setIsLoading(true);

		if (mod_message.length > MAX_MOD_MESSAGE_LENGTH) {
			setErrorMessage(`Moderator message cannot exceed ${MAX_MOD_MESSAGE_LENGTH} characters`);
			setIsLoading(false);
			return false;
		}

		try {
			const payload: ReportHandlePayload = {
				moderatorMessage: mod_message,
			};
			
			const handledReport = await moderationApi.rejectReport(reportId, payload)
			setMod_message("");
			setErrorMessage(null);
			
			return handledReport;
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

	const acceptReport = async () => {
		return (null);
	}

	const resetFields = () => {
		setMod_message("");
		setIsLoading(false);
	}

	const hasChanges = () => {
		return (
			mod_message !== ""
		)
	}
	return {
		mod_message,
		setMod_message,
		MAX_MOD_MESSAGE_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		rejectReport,
		acceptReport,
	}
}
