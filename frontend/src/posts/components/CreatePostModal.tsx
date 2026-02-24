import "../../App.css"
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { usePostCreation } from "./hooks/hooks";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";

interface CreatePostModalProps {
	onPostCreated: () => void;
	onClose: () => void;
}

export function CreatePostModal ({ onPostCreated, onClose }: CreatePostModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });

	// Custom hook that manages a post creation
	const {
		title, 
		setTitle,
		caption,
		setCaption,
		errorMessage,
		isLoading,
		resetFields,
		hasChanges,
		MAX_TITLE_LENGTH,
		MAX_CAPTION_LENGTH,
		handleImageChange,
		handlePostCreation,
	} = usePostCreation();

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
		const success = await handlePostCreation();
		if (success) {
			onPostCreated(); 
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
					<h2>Post an outfit</h2>
					<form onSubmit={handleSubmit}>
						<label>Title</label>
						<textarea
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="create-post-input"
						/>
						<div
							className={`char-counter ${
							title.length > MAX_TITLE_LENGTH ? "error" : ""
							}`}
						>
							{title.length} / {MAX_TITLE_LENGTH}
						</div>
						<label>Outfit Picture</label>
						<input
						type = "file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handleImageChange}
						/>
						<label>Caption</label>
						<textarea
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							rows={5}
							className="create-post-input"
						/>
						<div
						className={`char-counter ${
						caption.length > MAX_CAPTION_LENGTH ? "error" : ""
						}`}
						>
							{caption.length} / {MAX_CAPTION_LENGTH}
						</div>
						{errorMessage && (
							<div className="error-message shake-horizontal">
								{errorMessage}
							</div>
						)}
						<div className="modal-actions">
							<button type="submit"  className="modal-btn" disabled={isLoading}> 
								{isLoading ? "Posting..." : "Submit"} </button>
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