import { createPortal } from "react-dom";
import { useModalAnimation } from "../../../../common/hooks/useModalAnimation";
import { useBeforeUnload } from "../../../../common/hooks/useBeforeUnload";
import { ConfirmDialog } from "../../../../common/components/ConfirmDialog";
import { useUnsavedChangesGuard } from "../../../../common/hooks/useUnsavedChangesGuard";
import { Post } from "../../../../context/UserContext";
import { usePostReport } from "../../../hooks/usePostReport";
import { ReportCategory } from "../../../types";
import { useModal } from "../../../../context/ModalContext";
import { useTranslation } from "react-i18next";

interface ReportPostModalProps {
	post: Post,
	onPostReported: () => void;
	onClose: () => void;
}

export function ReportPostModal ({ post, onPostReported, onClose }: ReportPostModalProps) {

	// Function that runs the closing animation and then calls onClose() after the specified duration
	const { fadeOut, closeWithAnimation } = useModalAnimation({ onClose });
	const { showModal } = useModal();
	const { t } = useTranslation();

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
			showModal(t('postreport.submitted'));
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
					<h2>{t('postreport.reportpost')}</h2>
					<form onSubmit={handleSubmit}>
						<label>{t('postreport.cat')}</label>
						<select
							value={category || ""}
							 onChange={(e) => setCategory(e.target.value as ReportCategory)}
							className="report-post-input"
						>
						<option value="" disabled>{t('postreport.catselect')}</option>
						  {Object.values(ReportCategory).map((r) => (
							<option key={r} value={r}>{t(`report.${r}`)}</option>
							))}
						</select>
						<label>{t('postreport.des')}</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={5}
							placeholder={t('postreport.desplaceholder')}
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
								{isLoading ? t('post.saving') : t('post.submit')} </button>
							<button type="button" className="modal-btn" onClick={requestClose}> {t('editprofile.cancel')} </button>
						</div>
					</form>
				</div>
			</div>,
			document.body
		)}
		{showConfirm && (
			<ConfirmDialog
				message={t('postreport.changes')}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		)}
		</>
	);
}