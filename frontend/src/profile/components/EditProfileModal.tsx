import { createPortal } from "react-dom";
import { useProfileEdit } from "../hooks/hooks";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { useTranslation } from "react-i18next";

interface EditProfileModalProps {
	onClose: () => void;
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
	// Custom hook that manages all profile editing logic and state
	const {
		bio,
		setBio,
		displayName,
		setDisplayName,
		errorMessage,
		handleAvatarChange,
		handleCoverChange,
		resetFields,
		hasChanges,
		saveProfile,
		MAX_BIO_LENGTH,
		MAX_DISPLAYNAME_LENGTH,
	} = useProfileEdit();

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	//Function to translate
	const { t } = useTranslation();

	// Save profile changes via API
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const success = await saveProfile();
		if (success) {
			closeWithAnimation();
		}
	};

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

	// Activates the browser's native protection to prevent refresh or tab close if hasChanges() is true
	useBeforeUnload(hasChanges);

	return (
		<>
			{createPortal(
				<div className="modal-overlay" onClick={requestClose}>
					<div
						className={`modal-content-profile ${fadeOut ? "fade-out" : "fade-in"}`}
						onClick={(e) => e.stopPropagation()}
					>
						<h2>{t('editprofile.edit')}</h2>
						<form onSubmit={handleSubmit}>
						<label>{t('editprofile.name')}</label>
						<textarea
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							rows={1}
							className="create-post-input"
						/>
						<div
							className={`char-counter ${
								displayName.length > MAX_DISPLAYNAME_LENGTH ? "error" : ""
							}`}
						>
							{displayName.length} / {MAX_DISPLAYNAME_LENGTH}
						</div>
						<label>{t('editprofile.bio')}</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={5}
							className="create-post-input"
						/>
						<div
							className={`char-counter ${
								bio.length > MAX_BIO_LENGTH ? "error" : ""
							}`}
						>
							{bio.length} / {MAX_BIO_LENGTH}
						</div>
						<label>{t('editprofile.picture')}</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleAvatarChange}
						/>
						<small className="helper-text">
							{t('editprofile.format')}
						</small>
						<label>{t('editprofile.cover')}</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleCoverChange}
						/>
						<small className="helper-text">
							{t('editprofile.format')}
						</small>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit" className="modal-btn">
								{t('editprofile.save')}
							</button>
							<button type="button" className="modal-btn" onClick={requestClose}>
								{t('editprofile.cancel')}
							</button>
						</div>
						</form>
					</div>
				</div>,
				document.body
			)}
			{showConfirm && (
				<ConfirmDialog
					message={t('editprofile.changes')}
					onConfirm={confirmDiscard}
					onCancel={cancelDiscard}
				/>
			)}
		</>
	);
}