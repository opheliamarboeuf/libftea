import { useState } from "react";

interface UseUnsavedChangesGuardOptions {
	hasChanges: () => boolean;
	onDiscard: () => void; // Function to reset or discard changes
	onClose: () => void; // Function to actually close the modal or component
}

export function useUnsavedChangesGuard({
	hasChanges,
	onDiscard,
	onClose,
}: UseUnsavedChangesGuardOptions) {
	const [showConfirm, setShowConfirm] = useState(false); // Whether to show the confirmation dialog

	const requestClose = () => {
		if (hasChanges()) {
			setShowConfirm(true); // Otherwise, close immediately
		}
		else {
			onClose(); // Otherwise, close immediately
		}
	};

	// Reset unsaved changes, hides confirm dialog, close the modal
	const confirmDiscard = () => {
		onDiscard();
		setShowConfirm(false);
		onClose();
	};

	const cancelDiscard = () => {
		setShowConfirm(false);
	};

	return {
		showConfirm,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}