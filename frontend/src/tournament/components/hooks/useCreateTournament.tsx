import { useState } from "react";
import { tournamentApi } from "../../api";
import { useTranslation } from "react-i18next";

const MAX_THEME_LENGTH = 50;

export function useCreateTournament() {

	const [theme, setTheme] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { t } = useTranslation()

	const hasChanges = () => {
		return theme !== "" || startDate !== "" || endDate !== "";
	};

	const resetFields = () => {
		setTheme("");
		setStartDate("");
		setEndDate("");
		setErrorMessage(null);
	};

	const handleCreateTournament = async (): Promise<boolean> => {

		if (theme === "") {
			setErrorMessage(t('errors.theme'));
			return false;
		}

		if (theme.length > MAX_THEME_LENGTH) {
			setErrorMessage(t('errors.themelength', { length: MAX_THEME_LENGTH }));
			return false;
		}

		if (!startDate) {
			setErrorMessage(t('errors.start'));
			return false;
		}

		if (!endDate) {
			setErrorMessage(t('errors.end'));
			return false;
		}

		setIsLoading(true);

		try {
			const payload = {
				theme,
				startDate: new Date(startDate).toISOString(),
				endDate: new Date(endDate).toISOString(),
			};
			console.log('Sending payload:', payload);
			await tournamentApi.createTournament(payload, t);
			console.log('Tournament created successfully');
			resetFields();
			return true;
		}
		catch (error) {
			console.error('Error creating tournament:', error);
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(t('registerpage.serverfail'));
			}
		}
		finally {
			setIsLoading(false);
		}

		return false;
	};

	return {
		theme,
		setTheme,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handleCreateTournament,
		MAX_THEME_LENGTH,
	};
}