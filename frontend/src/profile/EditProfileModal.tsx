import { createPortal } from "react-dom";
import { useProfileEdit } from "./hooks/hooks";
import { useModalAnimation } from "../common/hooks/useModalAnimation";
import { ConfirmDialog } from "../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../common/hooks/useUnsavedChangesGuard";
import { useBeforeUnload } from "../common/hooks/useBeforeUnload";

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

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	// Save profile changes via API
	const handleSave = async () => {
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
						<h2>Edit Profile</h2>

						<label>Name</label>
						<textarea
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
						/>
						<label>Bio</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={5}
						/>
						<div
							className={`char-counter ${
								bio.length > MAX_BIO_LENGTH ? "error" : ""
							}`}
						>
							{bio.length} / {MAX_BIO_LENGTH}
						</div>
						<label>Profile Picture</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleAvatarChange}
						/>
						<small className="helper-text">
							Accepted formats: JPEG, PNG, WebP (Max 5MB)
						</small>
						<label>Cover Picture</label>
						<input
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handleCoverChange}
						/>
						<small className="helper-text">
							Accepted formats: JPEG, PNG, WebP (Max 5MB)
						</small>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button className="modal-btn" onClick={handleSave}>
								Save
							</button>
							<button className="modal-btn" onClick={requestClose}>
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
					onConfirm={confirmDiscard}
					onCancel={cancelDiscard}
				/>
			)}
		</>
	);
}