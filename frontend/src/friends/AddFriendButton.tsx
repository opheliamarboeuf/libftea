import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useTranslation } from 'react-i18next';

interface Props {
	userId: number;
}

export function AddFriendButton({ userId }: Props) {
	const { refreshUser } = useUser();
	const { showModal } = useModal();
	//pour les langues
	const { t } = useTranslation();

	const handleClick = async () => {
		try {
			await friendsApi.sendFriendRequest(userId);
			await refreshUser();
			showModal(t('friends.sent'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.sentfail'));
		}
	}
	return <button onClick={handleClick}>{t('friends.addfriend')}</button>;
}