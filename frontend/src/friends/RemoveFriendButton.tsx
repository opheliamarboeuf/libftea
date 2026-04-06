import { useUser } from '../context/UserContext';
import { useModal } from '../context/ModalContext';
import { ConfirmBlockDelete } from './ConfirmBlockDelete';
import { useState } from 'react';
import { useFriendsSocket } from './useFriendsSocket';
import { useTranslation } from 'react-i18next';

interface Props {
	userId: number;
}

export function RemoveFriendButton({ userId }: Props) {
	const { user, refreshUser } = useUser();
	const { showModal } = useModal();
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();

	const { emit } = useFriendsSocket(user?.id, {
		onFriendRemoved: () => {
			setLoading(false);
			refreshUser();
			showModal(t('friends.removed'));
		},
		onUserRemoved: () => {
			refreshUser();
		},
	});
	const handleClick = async () => {
		try {
			setLoading(true);
			emit('remove_friend', { userId: user?.id, friendId: userId });
			setShowConfirm(false);
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.requestfail'));
		}
	};
	return (
		<>
			<button
				onClick={() => setShowConfirm(true)}
				disabled={loading}
				className="friend-action-btn"
			>
				{loading ? t('friends.deleting') : t('friends.delete')}
			</button>

			{showConfirm && (
				<ConfirmBlockDelete
					message={t('friends.confirmremove')}
					onYes={handleClick}
					onNo={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
}
