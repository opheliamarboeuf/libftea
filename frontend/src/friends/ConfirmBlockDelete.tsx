import { createPortal } from "react-dom";

// Props definition for the confirmation dialog
interface ConfirmBlockDeleteProps {
	message: string;
	onYes: () => void;
	onNo: () => void;
}

// Confirmation dialog component rendered using a React portal
export function ConfirmBlockDelete({ message, onYes, onNo }: ConfirmBlockDeleteProps) {
	return createPortal(
		<div className="confirm-overlay">
			<div className="confirm-box">
				<p>{message}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={onYes}>
						Yes
					</button>
					<button className="modal-btn" onClick={onNo}>
						No
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}