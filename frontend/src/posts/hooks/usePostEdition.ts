import { useState } from 'react';
import { Post, useUser } from '../../context/UserContext';
import { postsApi } from '../api';
import { PostEditPayload } from '../types';
import { useTranslation } from 'react-i18next';

const MAX_TITLE_LENGTH = 50;
const MAX_CAPTION_LENGTH = 500;

export function usePostEdition(post: Post) {
	const { user, setUser } = useUser();

	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [title, setTitle] = useState(post.title);
	const [caption, setCaption] = useState(post.caption || '');
	const { t } = useTranslation();

	const handlePostEdition = async () => {
		setIsLoading(true);

		if (title === '') {
			setErrorMessage(t('errors.titleenter'));
			setIsLoading(false);
			return false;
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setErrorMessage(t('errors.titlelength', { length: MAX_TITLE_LENGTH }));
			setIsLoading(false);
			return false;
		}

		if (caption.length > MAX_CAPTION_LENGTH) {
			setErrorMessage(t('errors.captionlength', { length: MAX_CAPTION_LENGTH }));
			setIsLoading(false);
			return false;
		}

		try {
			const payload: PostEditPayload = {
				title,
				caption,
			};

			const updatedPost = await postsApi.updatePost(post.id, payload);
			setTitle(updatedPost.title);
			setCaption(updatedPost.caption || '');
			setErrorMessage(null);

			// Update the user context with the new post
			if (user) {
				const updatedPosts = user.posts.map((p) => (p.id === post.id ? updatedPost : p));
				setUser({
					...user,
					posts: updatedPosts,
				});
			}

			return updatedPost;
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
		setTitle(post.title);
		setCaption(post.caption || '');
		setIsLoading(false);
	};

	const hasChanges = () => {
		return title !== post.title || caption !== post.caption;
	};
	return {
		title,
		setTitle,
		caption,
		setCaption,
		MAX_TITLE_LENGTH,
		MAX_CAPTION_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostEdition,
	};
}
