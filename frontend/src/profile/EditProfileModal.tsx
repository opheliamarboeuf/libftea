import { useState } from "react";
import { createPortal } from "react-dom";
import { useProfileEdit } from "./hooks";
import { ConfirmDialog } from "./ConfirmDialog";

interface EditProfileModalProps {
	onClose: () => void;
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
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
						className={`modal-content ${fadeOut ? "fade-out" : "fade-in"}`}
						onClick={(e) => e.stopPropagation()}
					>
						<h2>Edit Profile</h2>
						<label>Name</label>
						<textarea value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
						<label>Bio</label>
						<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
						<div className={`char-counter ${bio.length > MAX_BIO_LENGTH ? "error" : ""}`}>
							{bio.length} / {MAX_BIO_LENGTH}
						</div>
						<label>Profile Picture</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleAvatarChange}
						/>
						<small className="helper-text">Accepted formats: JPEG, PNG, WebP (Max 5MB)</small>
						<label>Cover Picture</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleCoverChange}
						/>
						<small className="helper-text">Accepted formats: JPEG, PNG, WebP (Max 5MB)</small>
						{errorMessage && <div className="error-message shake-horizontal">{errorMessage}</div>}
						<div className="modal-actions">
							<button className="modal-btn" onClick={handleSave}>
								Save
							</button>
							<button className="modal-btn" onClick={handleCancel}>
								Cancel
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}

			{showConfirm && (
				<ConfirmDialog
					message="Looks like you've made some changes. Are you sure you want to exit without saving?"
					onConfirm={handleConfirmDiscard}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
}
