import "../../App.css"
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { Post } from "../../context/UserContext";
import { usePostReport } from "../hooks/usePostReport";

interface ReportPostModalProps {
	post: Post,
	onPostReported: () => void;
	onClose: () => void;
}

export function ReportPostModal ({ post, onPostReported, onClose }: ReportPostModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	// Custom hook that manages a post creation
	const {
		context,
		setContext,
		MAX_CONTEXT_LENGTH,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		handlePostReport,
	} = usePostReport(post, onPostReported);

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
						<label>Reason</label>
						<textarea
							value="text"
							// onChange={(e) => setTitle(e.target.value)}
							className="create-post-input"
						/>
						<label>Context</label>
						<textarea
							value={context}
							onChange={(e) => setContext(e.target.value)}
							rows={5}
							className="create-post-input"
						/>
						<div
						className={`char-counter ${
						context.length > MAX_CONTEXT_LENGTH ? "error" : ""
						}`}
						>
							{context.length} / {MAX_CONTEXT_LENGTH}
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