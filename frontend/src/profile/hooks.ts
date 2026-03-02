import { useState } from "react";
import { profileApi } from "./api";
import { useUser } from "../context/UserContext";

const MAX_BIO_LENGTH = 400;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function useProfileEdit() {
	// Get current user and setter from global context
	const { user, setUser } = useUser();

	// Form state initialized with existing user profile values
	const [bio, setBio] = useState(user?.profile.bio ?? "");
	const [displayName, setDisplayName] = useState(user?.profile.displayName ?? "");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const validateImage = (file: File, type: string): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return `${type} must be JPEG, PNG, or WebP`;
		}
		if (file.size > MAX_FILE_SIZE) {
			return `${type} must be under 5MB`;
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
		setDisplayName(user?.profile.displayName ?? "");
		setAvatarFile(null);
		setCoverFile(null);
		setErrorMessage(null);
	};

	const hasChanges = () => {
		return (
			bio !== (user?.profile.bio ?? "") ||
			displayName !== (user?.profile.displayName ?? "") ||
			avatarFile !== null ||
			coverFile !== null
		);
	};

	const saveProfile = async (): Promise<boolean> => {
		setErrorMessage(null);

		if (bio.length > MAX_BIO_LENGTH) {
			setErrorMessage(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`);
			return false;
		}

		setIsLoading(true);
		// Send update request to backend
		try {
			const data = await profileApi.updateProfile(bio, displayName, avatarFile, coverFile);

			// Update user context with new profile data
			setUser((prevUser) =>
				prevUser
					? {
							...prevUser,
							profile: {
								...prevUser.profile,
								bio: data.bio,
								displayName: data.displayName,
								avatarUrl: data.avatarUrl,
								coverUrl: data.coverUrl,
							},
					  }
					: prevUser
			);
			return true;
		} catch (error) {
			// Handle API or network errors
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Server unreachable");
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
		displayName,
		setDisplayName,
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
