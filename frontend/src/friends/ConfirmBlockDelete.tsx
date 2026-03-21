import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

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


	const { t } = useTranslation();

	return createPortal(
		<div className="confirm-overlay" onMouseDown={(e) => e.stopPropagation()}>
			<div className="confirm-box">
				<p>{t(message)}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={handleYes}>
						{t('common.yes')}
					</button>
					<button className="modal-btn" onClick={handleNo}>
						{t('common.no')}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}