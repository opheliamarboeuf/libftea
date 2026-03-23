import { createPortal } from 'react-dom';

// Props definition for the confirmation dialog
interface ConfirmDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
}

// Confirmation dialog component rendered using a React portal

export function ConfirmDialog({
	message,
	onConfirm,
	onCancel,
	confirmLabel = 'Yes',
	cancelLabel = 'No',
}: ConfirmDialogProps) {
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
		document.body,
	);
}
