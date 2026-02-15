import { createPortal } from "react-dom";

// Props definition for the confirmation dialog
interface ConfirmDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

// Confirmation dialog component rendered using a React portal
export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
	return createPortal(
		<div className="confirm-overlay">
			<div className="confirm-box">
				<p>{message}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={onConfirm}>
						Discard
					</button>
					<button className="modal-btn" onClick={onCancel}>
						Stay
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
