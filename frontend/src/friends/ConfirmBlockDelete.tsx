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

	const { t } = useTranslation();

	return createPortal(
		<div className="confirm-overlay">
			<div className="confirm-box">
				<p>{t(message)}</p>
				<div className="confirm-actions">
					<button className="modal-btn" onClick={onYes}>
						{t('common.yes')}
					</button>
					<button className="modal-btn" onClick={onNo}>
						{t('common.no')}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}