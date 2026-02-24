import { useState } from "react";
import { createPortal } from "react-dom";
import { useProfileEdit } from "./hooks";
import { ConfirmDialog } from "./ConfirmDialog";
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
	} = useProfileEdit();

	const [showConfirm, setShowConfirm] = useState(false);
	const [fadeOut, setFadeOut] = useState(false);
	const { t } = useTranslation();

	const closeWithAnimation = () => {
		setFadeOut(true);
		setTimeout(() => {
			onClose();
		}, 250);
	};

	const handleCancel = () => {
		if (hasChanges()) {
			setShowConfirm(true);
			return;
		}
		closeWithAnimation();
	};

	const handleConfirmDiscard = () => {
		resetFields();
		setShowConfirm(false);
		onClose();
	};

	// Save profile changes via API
	const handleSave = async () => {
		const success = await saveProfile();
		if (success) {
			closeWithAnimation();
		}
	};

	return (
		<>
			{createPortal(
				<div className="modal-overlay" onClick={handleCancel}>
					<div
						className={`modal-content-profile ${fadeOut ? "fade-out" : "fade-in"}`}
						onClick={(e) => e.stopPropagation()}
					>
						<h2>{t('editprofile.edit')}</h2>
						<label>{t('editprofile.name')}</label>
						<textarea value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
						<label>{t('editprofile.bio')}</label>
						<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
						<div className={`char-counter ${bio.length > MAX_BIO_LENGTH ? "error" : ""}`}>
							{bio.length} / {MAX_BIO_LENGTH}
						</div>
						<label>{t('editprofile.picture')}</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleAvatarChange}
						/>
						<small className="helper-text">{t('editprofile.format')}</small>
						<label>{t('editprofile.cover')}</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleCoverChange}
						/>
						<small className="helper-text">{t('editprofile.format')}</small>
						{errorMessage && <div className="error-message shake-horizontal">{errorMessage}</div>}
						<div className="modal-actions">
							<button className="modal-btn" onClick={handleSave}>
								{t('editprofile.save')}
							</button>
							<button className="modal-btn" onClick={handleCancel}>
								{t('editprofile.cancel')}
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}

			{showConfirm && (
				<ConfirmDialog
					message={t('editprofile.changes')}
					onConfirm={handleConfirmDiscard}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
}
