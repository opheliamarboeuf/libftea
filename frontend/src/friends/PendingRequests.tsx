import { useState } from "react";
import { friendsApi } from "./api";
import { usePendingRequests } from "./hooks";
import { useModal } from "../context/ModalContext";
import { useTranslation } from 'react-i18next';

export function PendingRequests() {
	const { pending, refetch } = usePendingRequests();
	const [ loading, setLoading ] = useState(false);
	const { showModal } = useModal();
	const { t } = useTranslation();

	const handleAccept = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.acceptFriendRequest(userId);
			showModal(t('friends.accepted'));
			await refetch();
		} catch (error) {
			console.error('Failed to process request', error);
			showModal(t('friends.requestfail'));
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.rejectFriendRequest(userId);
			showModal(t('friends.rejected'));
			await refetch();
		} catch (error) {
			console.error('Failed to process request:', error);
			showModal(t('friends.requestfail'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h3>{t('friends.requests')}</h3>
			{pending.length === 0 && <p>{t('friends.nopending')}</p>}
			{pending.map(user => (
				<div key={user.id}>
					<span>{user.username}</span>

					<button onClick={() => handleAccept(user.id)} disabled={loading}>
						{t('friends.accept')}
					</button>

					<button onClick={() => handleReject(user.id)} disabled={loading}>
						{t('friends.reject')}
					</button>
				</div>
			))}
		</div>
	);
}