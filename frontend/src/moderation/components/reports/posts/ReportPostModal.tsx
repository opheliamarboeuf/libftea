import { createPortal } from "react-dom";
import { useModalAnimation } from "../../../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../../../common/hooks/useUnsavedChangesGuard";
import { Post } from "../../../../context/UserContext";
import { usePostReport } from "../../../hooks/usePostReport";
import { ReportCategory } from "../../../types";
import { useModal } from "../../../../context/ModalContext";

interface ReportPostModalProps {
	post: Post,
	onPostReported: () => void;
	onClose: () => void;
}

export function ReportPostModal ({ post, onPostReported, onClose }: ReportPostModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });
	const { showModal } = useModal();

	// Custom hook that manages a post creation
	const {
		category,
		setCategory,
		description,
		setDescription,
		MAX_DESCRIPTION_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostReport,
	} = usePostReport(post);

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
		const res = await handlePostReport();
		if (res) {
			showModal("Report submitted successfully");
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
					<h2>Report a post</h2>
					<form onSubmit={handleSubmit}>
						<label>Category</label>
						<select
							value={category || ""}
							 onChange={(e) => setCategory(e.target.value as ReportCategory)}
							className="report-post-input"
						>
						<option value="" disabled>Select a report category</option>
						  {Object.values(ReportCategory).map((r) => (
							<option key={r} value={r}>{r.replaceAll("_", " ")}</option>
							))}
						</select>
						<label>Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={5}
							placeholder="You can add more details here"
							className="report-post-input"
						/>
						<div
						className={`char-counter ${
						description.length > MAX_DESCRIPTION_LENGTH ? "error" : ""
						}`}
						>
							{description.length} / {MAX_DESCRIPTION_LENGTH}
						</div>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit"  className="modal-btn" disabled={isLoading}> 
								{isLoading ? "Saving..." : "Submit"} </button>
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