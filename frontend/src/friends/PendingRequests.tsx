import { useState } from "react";
import { friendsApi } from "./api";
import { usePendingRequests } from "./hooks";
import { useModal

 } from "../context/ModalContext";
export function PendingRequests() {
	const { pending, refetch } = usePendingRequests();
	const [ loading, setLoading ] = useState(false);
	const { showModal } = useModal();

	const handleAccept = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.acceptFriendRequest(userId);
			showModal("Friend request accepted");
			await refetch();
		} catch (error) {
			console.error('Failed to process request', error);
			showModal("Failed to process request");
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (userId: number) => {
		setLoading(true);
		try {
			await friendsApi.rejectFriendRequest(userId);
			showModal("Friend request rejected");
			await refetch();
		} catch (error) {
			console.error('Failed to process request:', error);
			showModal("Failed to process request");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h3>Friend Requests</h3>
			{pending.length === 0 && <p>No pending requests</p>}
			{pending.map(user => (
				<div 
					key={user.id}
					style={{
					display: "flex",
					alignItems: "center",
					gap: "20px",
					marginBottom: "8px",
					}}
				>
					<span>{user.username}</span>

					<button onClick={() => handleAccept(user.id)} disabled={loading}>
						Accept
					</button>

					<button onClick={() => handleReject(user.id)} disabled={loading}>
						Reject
					</button>
				</div>
			))}
		</div>
	);
}