import "../../App.css"
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { usePostCreation } from "../hooks/usePostCreation";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { useTranslation } from "react-i18next";

interface CreatePostModalProps {
	onPostCreated: () => void;
	onClose: () => void;
}

export function CreatePostModal ({ onPostCreated, onClose }: CreatePostModalProps) {

	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	//Function to translate
	const { t } = useTranslation();

	// Custom hook that manages a post creation
	const {
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
		handlePostCreation,
	} = usePostCreation();

		// Guard unsaved changes
		const {
			showConfirm,
			requestClose,
			confirmDiscard,
			cancelDiscard,
		} = useUnsavedChangesGuard({
			hasChanges,
			onDiscard: resetFields,
			onClose: closeWithAnimation,
		});
	

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const success = await handlePostCreation();
		if (success) {
			onPostCreated(); 
			closeWithAnimation();
		}
	};

	useBeforeUnload(hasChanges);

	return (
		<>
		{createPortal(
			<div className="modal-overlay" onClick={requestClose}>
				<div 
					className={`modal-content-post ${fadeOut ? "fade-out" : "fade-in"}`}
					onClick={(e) => e.stopPropagation()}
				>
					<h2>{t('feedpage.postoutfit')}</h2>
					<form onSubmit={handleSubmit}>
						<label>{t('post.title')}</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="title-input"
							maxLength={MAX_TITLE_LENGTH}
						/>
						<div
							className={`char-counter ${
							title.length > MAX_TITLE_LENGTH ? "error" : ""
							}`}
						>
							{title.length} / {MAX_TITLE_LENGTH}
						</div>
						<label>{t('post.picture')}</label>
						<input
						type = "file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handleImageChange}
						/>
						<label>{t('post.caption')}</label>
						<textarea
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							rows={5}
							className="create-post-input"
						/>
						<div
						className={`char-counter ${
						caption.length > MAX_CAPTION_LENGTH ? "error" : ""
						}`}
						>
							{caption.length} / {MAX_CAPTION_LENGTH}
						</div>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit"  className="modal-btn" disabled={isLoading}> 
								{isLoading ? t('post.posting') : t('post.submit')} </button>
							<button type="button" className="modal-btn" onClick={requestClose}> {t('editprofile.cancel')} </button>
						</div>
					</form>
				</div>
			</div>,
			document.body
		)}
		{showConfirm && (
			<ConfirmDialog
				message={t('post.changes')}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		)}
		</>
	);
}