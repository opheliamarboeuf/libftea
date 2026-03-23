import "../../App.css"
import { createPortal } from "react-dom";
import { useModalAnimation } from "../../common/hooks/useModalAnimation";
import { usePostEdition } from "../hooks/usePostEdition";
import { useBeforeUnload } from "../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../common/hooks/useUnsavedChangesGuard";
import { Post } from "../../context/UserContext";

interface EditPostModalProps {
	post: Post,
	onPostEdited: () => void;
	onClose: () => void;
}

export function EditPostModal ({ post, onPostEdited, onClose }: EditPostModalProps) {

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
		handlePostEdition,
	} = usePostEdition(post, onPostEdited);

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
		const res = await handlePostEdition();
		if (res) {
			onPostEdited(); 
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
					<h2>Edit your post</h2>
					<form onSubmit={handleSubmit}>
						<label>Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="title-input"
							maxLength={MAX_TITLE_LENGTH}
						/>
						<div
							className={`char-counter ${
							title.length > MAX_TITLE_LENGTH ? "error" : ""
							}`}
						>
							{title.length} / {MAX_TITLE_LENGTH}
						</div>
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