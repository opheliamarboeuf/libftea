import { friendsApi } from "./api";
import { usePendingRequests } from "./hooks";

export function PendingRequests() {
	const { pending } = usePendingRequests();

	return (
		<div>
			<h3>Demandes d'amis</h3>

			{pending.map(user => (
				<div key={user.id}>
					<span>{user.username}</span>

					<button onClick={() => friendsApi.acceptFriendRequest(user.id)}>
						Accepter
					</button>

					<button onClick={() => friendsApi.rejectFriendRequest(user.id)}>
						Refuser
					</button>
				</div>
			))}
		</div>
	);
}