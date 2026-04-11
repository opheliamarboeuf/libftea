import { useState } from 'react';
import { mockDatabase } from '../../../mockData';
import { useUser } from '../../../context/UserContext';
import { useTranslation } from 'react-i18next';

const MAX_TITLE_LENGTH = 50;
const MAX_CAPTION_LENGTH = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const POST_IMAGE_SIZE = 500; // 500x500 for posts/tournaments

// this hook now expects the id of the battle/tournament that the user is
// joining so it can include it in the request URL.
export function useTournamentJoin(battleId: number) {
	const [title, setTitle] = useState('');
	const [caption, setCaption] = useState('');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { user } = useUser();
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

	const resizeImage = async (file: File): Promise<File> => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (event) => {
				const img = new Image();
				img.src = event.target?.result as string;
				img.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = POST_IMAGE_SIZE;
					canvas.height = POST_IMAGE_SIZE;
					const ctx = canvas.getContext('2d');
					if (ctx) {
						ctx.drawImage(img, 0, 0, POST_IMAGE_SIZE, POST_IMAGE_SIZE);
					}
					canvas.toBlob(
						(blob) => {
							if (blob) {
								const resizedFile = new File([blob], file.name, { type: file.type });
								resolve(resizedFile);
							} else {
								resolve(file);
							}
						},
						file.type,
						0.85
					);
				};
			};
		});
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, 'Outfit picture');
			if (error) {
				setErrorMessage(error);
				e.target.value = '';
				return;
			}
			try {
				const resizedFile = await resizeImage(file);
				setImageFile(resizedFile);
				setErrorMessage(null);
			} catch (error) {
				setErrorMessage(t('errors.imageresize') || 'Failed to resize image');
				e.target.value = '';
			}
		} else {
			setImageFile(null);
			setErrorMessage(null);
		}
	};

	const hasChanges = () => {
		return title !== '' || caption !== '' || imageFile !== null;
	};

	const resetFields = () => {
		setTitle('');
		setCaption('');
		setImageFile(null);
		setErrorMessage(null);
	};

	const errorMessages = (message: string): string => {
		if (message.includes('already registered')) return 'errors.tournamentuser';
		else if (message.includes('not active')) return 'errors.tournamentactive';
	};

	const handleJoinTournament = async (): Promise<boolean> => {
		if (title === '') {
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
			const objectUrl = URL.createObjectURL(imageFile);
			const postId = Math.max(0, ...mockDatabase.posts.map((p) => p.id)) + 1;
			const authorBase = mockDatabase.users.find((u) => u.id === user?.id);
			const now = new Date();
			const newPost = {
				id: postId,
				title,
				caption,
				imageUrl: objectUrl,
				authorId: user!.id,
				createdAt: now,
				updatedAt: now,
				author: authorBase,
				comments: [],
				likes: [],
			};
			mockDatabase.posts.push(newPost);
			mockDatabase.battleParticipants.push({
				id: Math.max(0, ...mockDatabase.battleParticipants.map((bp) => bp.id)) + 1,
				battleId,
				userId: user!.id,
				postId,
				submittedAt: now,
			});
			resetFields();
			return true;
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(t(errorMessages(error.message)));
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
