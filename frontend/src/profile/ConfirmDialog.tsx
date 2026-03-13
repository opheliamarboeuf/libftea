import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

// Props definition for the confirmation dialog
interface ConfirmDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

// Confirmation dialog component rendered using a React portal
export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
	const { t } = useTranslation();

	return createPortal(
		<div className="confirm-overlay">
			<div className="confirm-box">
				<p>{message}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={onConfirm}>
						{t('confirmdialog.discard')}
					</button>
					<button className="modal-btn" onClick={onCancel}>
						{t('confirmdialog.stay')}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
