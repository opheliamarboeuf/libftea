import { useState } from "react";
import { friendsApi } from "./api";
import { usePendingRequests } from "./hooks";

export function PendingRequests() {
	const { pending, refetch } = usePendingRequests();
	const [ loading, setLoading ] = useState(false);

	const handleAccept = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.acceptFriendRequest(userId);
			alert('Demande acceptée!');
			await refetch();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur');
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.rejectFriendRequest(userId);
			alert('Demande refusée!');
			await refetch();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h3>Demandes d'amis</h3>
			{pending.length === 0 && <p>Aucune demande en attente</p>}
			{pending.map(user => (
				<div key={user.id}>
					<span>{user.username}</span>

					<button onClick={() => handleAccept(user.id)} disabled={loading}>
						Accepter
					</button>

					<button onClick={() => handleReject(user.id)} disabled={loading}>
						Refuser
					</button>
				</div>
			))}
		</div>
	);
}