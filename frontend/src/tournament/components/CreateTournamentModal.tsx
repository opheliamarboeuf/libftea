import "../../App.css";
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useCreateTournament } from "./hooks/useCreateTournament";
import { useTranslation } from "react-i18next";

interface CreateTournamentModalProps {
	onClose: () => void;
	onCreated: () => void;
}

export function CreateTournamentModal ({onCreated , onClose }: CreateTournamentModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	// Custom hook that manages a tournament join
	const {
		theme, 
		setTheme,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handleCreateTournament,
		MAX_THEME_LENGTH,
	} = useCreateTournament();

		// Guard unsaved changes
		const {
			showConfirm,
			requestClose,
			confirmDiscard,
			cancelDiscard,
		} = useUnsavedChangesGuard({
			hasChanges,
			onDiscard: resetFields,
			onClose: closeWithAnimation,
		});
	

	const { t } = useTranslation();

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const success = await handleCreateTournament();
		if (success) {
			onCreated(); 
			closeWithAnimation();
		}
	};

	useBeforeUnload(hasChanges);

	return (
		<>
		{createPortal(
			<div className="modal-overlay" onClick={requestClose}>
				<div 
					className={`modal-content-post ${fadeOut ? "fade-out" : "fade-in"}`}
					onClick={(e) => e.stopPropagation()}
				>
					<h2>{t('tournament.createtournament')}</h2>
					<form onSubmit={handleSubmit}>
						<label>{t('tournament.theme')}</label>
						<input
							type = "text"
							value={theme}
							onChange={(e) => setTheme(e.target.value)}
							className="create-post-input"
						/>
						<div
							className={`char-counter ${
							theme.length > MAX_THEME_LENGTH ? "error" : ""
							}`}
						>
							{theme.length} / {MAX_THEME_LENGTH}
						</div>
						<label>{t('tournament.start')}</label>
						<input
							type = "datetime-local"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
						<label>{t('tournament.end')}</label>
						<input
							type = "datetime-local"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit"  className="modal-btn" disabled={isLoading}> 
								{isLoading ? t('tournament.creating') : t('tournament.create') } </button>
							<button type="button" className="modal-btn" onClick={requestClose}> {t('editprofile.cancel')} </button>
						</div>
					</form>
				</div>
			</div>,
			document.body
		)}
		{showConfirm && (
			<ConfirmDialog
				message={t('tournament.changes')}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		)}
		</>
	);
}