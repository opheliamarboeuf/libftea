import { createContext, useState, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';

// Define the shape of the modal context
interface ModalContextType {
	showModal: (message: string) => void;
	hideModal: () => void;
}

// Create the React context for the modal, with default undefined
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component that wraps the app and manages the modal state
export function ModalProvider({ children }: { children: ReactNode }) {
	const [message, setMessage] = useState<string | null>(null);
	const { t } = useTranslation();

	const showModal = (msg: string) => setMessage(msg);
	const hideModal = () => setMessage(null);

	return (
		<ModalContext.Provider value={{ showModal, hideModal }}>
			{/* Render all the components that are wrapped by this provider */}
			{children}
			{message && (
				<div className="modal-overlay" onClick={hideModal}>
					{/* Modal content box; stop clicks from closing the modal */}
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<p>{message}</p>
						<button className="modal-btn" onClick={hideModal}>
							{t('common.close')}
						</button>
					</div>
				</div>
			)}
		</ModalContext.Provider>
	);
}

// Custom hook to access the modal context easily
export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('useModal must be used within ModalProvider');
	return context;
};
