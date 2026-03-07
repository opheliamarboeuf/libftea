import "../../App.css";
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useCreateTournament } from "../hooks/useCreateTournament";

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
		startsAt,
		setStartsAt,
		endsAt,
		setEndsAt,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		MAX_THEME_LENGTH,
		handleImageChange,
		handleCreateTournament,
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
					<h2>Enter the contest</h2>
					<form onSubmit={handleSubmit}>
						<label>theme</label>
						<input
							type = "text"
							value={theme}
							onChange={(e) => setTheme(e.target.value)}
							className="create-post-input"
						/>
						<label>Start date</label>
						<input
							type = "datetime-local"
							value={startsAt}
							onChange={(e) => setStartsAt(e.target.value)}
						/>
						<label>End date</label>
						<input
							type = "datetime-local"
							value={endsAt}
							onChange={(e) => setEndsAt(e.target.value)}
						/>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit"  className="modal-btn" disabled={isLoading}> 
								{isLoading ? "Creating..." : "Create"} </button>
							<button type="button" className="modal-btn" onClick={requestClose}> Cancel </button>
						</div>
					</form>
				</div>
			</div>,
			document.body
		)}
		{showConfirm && (
			<ConfirmDialog
				message="Looks like you've made some changes. Are you sure you want to exit without saving?"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		)}
		</>
	);
}