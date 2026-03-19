import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

// Props definition for the confirmation dialog
interface ConfirmDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
}

// Confirmation dialog component rendered using a React portal
export function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel, cancelLabel }: ConfirmDialogProps) {

	const { t } = useTranslation();
	confirmLabel = t('common.confirm');
	cancelLabel = t('editprofile.cancel');
	
	return createPortal(
		<div className="confirm-overlay">
			<div className="confirm-box">
				<p>{message}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={onCancel}>
						{cancelLabel}
					</button>
					<button className="modal-btn" onClick={onConfirm}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
