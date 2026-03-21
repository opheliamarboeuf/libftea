import { moderationApi } from '../api';
import { ConfirmDialog } from '../../common/components/ConfirmDialog';
import { useModal } from '../../context/ModalContext';

interface BanUserButtonProps {
	targetId: number;
	onAction?: () => Promise<void>;
	showConfirm: boolean;
	setShowConfirm: (v: boolean) => void;
}

export function BanUserButton({
	targetId,
	onAction,
	showConfirm,
	setShowConfirm,
}: BanUserButtonProps) {
	const { showModal } = useModal();

	const handleBan = async () => {
		try {
			await moderationApi.banUser(targetId);
			if (onAction) await onAction();
			showModal('User banned');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'An error occurred';
			showModal(message);
		}
	};

	return (
		<>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setShowConfirm(true);
				}}
				className="ban-user-btn"
			>
				Ban User
			</button>
			{showConfirm && (
				<ConfirmDialog
					message="Are you sure you want to ban this user?"
					confirmLabel="Yes"
					cancelLabel="No"
					onConfirm={async () => {
						await handleBan();
						setShowConfirm(false);
					}}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
}
