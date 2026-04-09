import { useState } from 'react';
import { ReportCategory } from '../../moderation/types';
import { moderationApi } from '../../moderation/api';
import { useTranslation } from 'react-i18next';

const MAX_DESCRIPTION_LENGTH = 150;

export function useUserReport(_targetId) {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState<ReportCategory | null>(null);
	const { t } = useTranslation();

	const handleUserReport = async () => {
		setIsLoading(true);

		if (!category) {
			setErrorMessage(t('errors.catselect'));
			setIsLoading(false);
			return false;
		}

		if (description.length > MAX_DESCRIPTION_LENGTH) {
			setErrorMessage(t('errors.deslength', { length: MAX_DESCRIPTION_LENGTH }));
			setIsLoading(false);
			return false;
		}

		try {
			await moderationApi.reportUser();
			setDescription('');
			setCategory(null);
			setErrorMessage(null);
			return true;
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(t('registerpage.serverfail'));
			}
		} finally {
			setIsLoading(false);
		}
	};

	const resetFields = () => {
		setCategory(null);
		setDescription('');
		setIsLoading(false);
	};

	const hasChanges = () => {
		return category !== null || description !== '';
	};
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
		handleUserReport,
	};
}
