import { createPortal } from "react-dom";

// Props definition for the confirmation dialog
interface ConfirmBlockDeleteProps {
	message: string;
	onYes: () => void;
	onNo: () => void;
}

// Confirmation dialog component rendered using a React portal
export function ConfirmBlockDelete({ message, onYes, onNo }: ConfirmBlockDeleteProps) {
	const handleYes = (e: React.MouseEvent) => {
		e.stopPropagation();
		onYes();
	};

	const handleNo = (e: React.MouseEvent) => {
		e.stopPropagation();
		onNo();
	};

	return createPortal(
		<div className="confirm-overlay" onMouseDown={(e) => e.stopPropagation()}>
			<div className="confirm-box">
				<p>{message}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={handleYes}>
						Yes
					</button>
					<button className="modal-btn" onClick={handleNo}>
						No
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}