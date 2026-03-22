import { moderationApi } from '../api';
import { ConfirmDialog } from '../../common/components/ConfirmDialog';
import { useModal } from '../../context/ModalContext';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();

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
				{t('userreport.ban')}
			</button>
			{showConfirm && (
				<ConfirmDialog
					message={t('userreport.banconfirm')}
					confirmLabel={t('common.yes')}
					cancelLabel={t('common.no')}
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
