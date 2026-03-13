import { useState, useEffect } from "react"
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
	const [requestSent, setRequestSent] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user?.friendRequestsSent?.includes(userId)) {
			setRequestSent(true);
		}
	}, [userId, userId]);
	
	//pour les langues
	const { t } = useTranslation();

	const handleClick = async () => {
		setLoading(true);
		try {
			if (!requestSent) {
				await friendsApi.sendFriendRequest(userId);
				await refreshUser();
				showModal("Friend request sent");
				setRequestSent(true);
			} else {
				await friendsApi.cancelRequest(userId);
				showModal("Friend request cancelled");
				setRequestSent(false);
			}
			await refreshUser();
			await friendsApi.sendFriendRequest(userId);
			await refreshUser();
			showModal(t('friends.sent'));
		} catch (error) {
			console.error('Error:', error);
			showModal(requestSent ? "Failed to cancel request" : "Failed to send friend request");
		} finally {
			setLoading(false);
			showModal(t('friends.sentfail'));
		}
	}
	return (
		<button onClick={handleClick} disabled={loading}>
			{loading ? "Processing..." : requestSent ? "Cancel request" : "Add Friend"}
		</button>
		);
	return <button onClick={handleClick}>{t('friends.addfriend')}</button>;
}