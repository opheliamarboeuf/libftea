import { useState } from "react";
import { tournamentApi } from "../../api";
import { useTranslation } from "react-i18next";

const MAX_TITLE_LENGTH = 50;
const MAX_CAPTION_LENGTH = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// this hook now expects the id of the battle/tournament that the user is
// joining so it can include it in the request URL.
export function useTournamentJoin(battleId: number) {
	const [title, setTitle] = useState("");
	const [caption, setCaption] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { t } = useTranslation();

	const validateImage = (file: File, type: string): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return t('errors.type', { type: type });
		}
		if (file.size > MAX_FILE_SIZE) {
			return t('errors.volume', { type: type });
		}
		return null;
	};
	
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, "Outfit picture");
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

	const handleJoinTournament = async (): Promise<boolean> => {
		if (title === ""){
			setErrorMessage(t('errors.titleenter'));
			return false;
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setErrorMessage(t('errors.titlelength', { length: MAX_TITLE_LENGTH }));
			return false;
		}

		if (caption.length > MAX_CAPTION_LENGTH) {
			setErrorMessage(t('errors.captionlength', { length: MAX_CAPTION_LENGTH }));
			return false;
		}

		if (!imageFile) {
			setErrorMessage(t('errors.image'));
			return false;
		}

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("image", imageFile);
			formData.append("title", title);
			formData.append("caption", caption);

			await tournamentApi.joinTournament(battleId, formData);
			resetFields();
			return true;
		}
		catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(t('registerpage.serverfail'));
			}
		} finally {
			setIsLoading(false);
		}
	};

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
		handleJoinTournament,
	};
}
