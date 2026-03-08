import { useState } from "react";
import { tournamentApi } from "../../api";

const MAX_THEME_LENGTH = 50;

export function useCreateTournament() {

	const [theme, setTheme] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
			setErrorMessage("Please enter a theme");
			return false;
		}

		if (theme.length > MAX_THEME_LENGTH) {
			setErrorMessage(`Theme cannot exceed ${MAX_THEME_LENGTH} characters`);
			return false;
		}

		if (!startDate) {
			setErrorMessage("Please select a start date");
			return false;
		}

		if (!endDate) {
			setErrorMessage("Please select an end date");
			return false;
		}

		setIsLoading(true);

		try {
			const payload = {
				theme,
				startDate: startDate + ':00.000Z',
				endDate: endDate + ':00.000Z',
			};
			console.log('Sending payload:', payload);
			await tournamentApi.createTournament(payload);
			console.log('Tournament created successfully');
			resetFields();
			return true;
		}
		catch (error) {
			console.error('Error creating tournament:', error);
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Server unreachable");
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