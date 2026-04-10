import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { mockDatabase } from "../mockData";

const MAX_BIO_LENGTH = 400;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function useProfileEdit() {
	// Get current user and setter from global context
	const { user, setUser } = useUser();

	// Form state initialized with existing user profile values
	const [bio, setBio] = useState(user?.profile.bio ?? "");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
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

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, "Profile picture");
			if (error) {
				setErrorMessage(error);
				e.target.value = "";
				return;
			}
		}
		setAvatarFile(file);
		setErrorMessage(null);
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, "Cover picture");
			if (error) {
				setErrorMessage(error);
				e.target.value = "";
				return;
			}
		}
		setCoverFile(file);
		setErrorMessage(null);
	};

	const resetFields = () => {
		setBio(user?.profile.bio ?? "");
		setAvatarFile(null);
		setCoverFile(null);
		setErrorMessage(null);
	};

	const hasChanges = () => {
		return (
			bio !== (user?.profile.bio ?? "") ||
			avatarFile !== null ||
			coverFile !== null
		);
	};

	const saveProfile = async (): Promise<boolean> => {
		setErrorMessage(null);

		if (bio.length > MAX_BIO_LENGTH) {
			setErrorMessage(t('errors.biolength', { length: MAX_BIO_LENGTH }));
			return false;
		}

		setIsLoading(true);
		try {
			const newAvatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : (user?.profile?.avatarUrl ?? null);
			const newCoverUrl = coverFile ? URL.createObjectURL(coverFile) : (user?.profile?.coverUrl ?? null);

			// Update mockDatabase
			const dbUser = mockDatabase.users.find((u) => u.id === user?.id);
			if (dbUser) {
				dbUser.profile.bio = bio;
				if (avatarFile) dbUser.profile.avatarUrl = newAvatarUrl;
				if (coverFile) dbUser.profile.coverUrl = newCoverUrl;
			}

			// Update user context
			setUser((prevUser) =>
				prevUser
					? {
							...prevUser,
							profile: {
								...prevUser.profile,
								bio,
								avatarUrl: newAvatarUrl,
								coverUrl: newCoverUrl,
							},
					  }
					: prevUser
			);
			return true;
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(t('registerpage.serverfail'));
			}
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	// Expose state and handlers to components
	return {
		bio,
		setBio,
		avatarFile,
		coverFile,
		errorMessage,
		isLoading,
		handleAvatarChange,
		handleCoverChange,
		resetFields,
		hasChanges,
		saveProfile,
		MAX_BIO_LENGTH,
	};
}
