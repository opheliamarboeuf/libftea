import { createPortal } from "react-dom";
import { useModalAnimation } from "../../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../../profile/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../../common/hooks/useUnsavedChangesGuard";
import { useHandleReport } from "../../hooks/useHandleReport";
import { useModal } from "../../../context/ModalContext";

interface HandleReportPostModalProps {
	reportId: number,
	onPostReported: () => void;
	onClose: () => void;
}

export function HandleReportModal ({ reportId, onPostReported, onClose }: HandleReportPostModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });
	const { showModal } = useModal();

	// Custom hook that manages a post creation
	const {
		mod_message,
		setMod_message,
		MAX_MOD_MESSAGE_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		rejectReport,
		acceptReport,
	} = useHandleReport(reportId);

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

	const handleReject = async () => {
		const res = await rejectReport();
		if (res) {
			showModal("Report rejected successfully");
			onPostReported(); 
			closeWithAnimation();
		}
	};

		const handleAccept = async () => {
		const res = await acceptReport();
		if (res) {
			showModal("Report accepted successfully");
			onPostReported(); 
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
					<h2>Handle report</h2>
						<label>Moderation Message</label>
						<textarea
							value={mod_message || ""}
							rows={5}
							onChange={(e) => setMod_message(e.target.value)}
							className="report-message-input"
						/>
						<div
						className={`char-counter ${
						mod_message.length > MAX_MOD_MESSAGE_LENGTH ? "error" : ""
						}`}
						>
							{mod_message.length} / {MAX_MOD_MESSAGE_LENGTH}
						</div>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button
								type="button"
								className="modal-btn"
								onClick={requestClose}
								>
								Cancel
							</button>
							<button
								type="button"
								className="modal-btn reject-btn"
								onClick={handleReject}
								disabled={isLoading}
							>
								Reject Report
							</button>

							<button
								type="button"
								className="modal-btn accept-btn"
								onClick={handleAccept}
								disabled={isLoading}
								>
								Accept Report
							</button>
						</div>
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