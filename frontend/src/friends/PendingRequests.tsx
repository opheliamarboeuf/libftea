import { useState } from "react";
import { useUser } from "../context/UserContext";
import { friendsApi } from "./api";
import { usePendingRequests } from "./hooks";
import { useModal } from "../context/ModalContext";
import { Link } from "react-router-dom";
import { useFriendsSocket } from "./useFriendsSocket";
import "./friends.css"

export function PendingRequests() {
	const { pending, refetch } = usePendingRequests();
	const [ loading, setLoading ] = useState(false);
	const { showModal } = useModal();
	const { refreshUser, user } = useUser();
	const API_URL = "http://localhost:3000";

	const { emit } = useFriendsSocket(user?.id, {
		onRequestAccepted: () => {
			setLoading(false);
			refreshUser();
			showModal("Friend request accepted");
			refetch();
		},
		onRequestRejected: async () => {
			setLoading(false);
			refreshUser();
			showModal("Friend request rejected");
			refetch();
		}
	});

	const handleAccept = async (userId: number) => {
		setLoading(true);
		emit("accept_friend_request", { requesterId: userId, addresseId: user?.id });
	};

	const handleReject = async (userId: number) => {
		setLoading(true);
		emit("reject_friend_request", { requesterId: userId, addresseId: user?.id });
	};

	return (
		<div>
			{pending.length === 0 && <p>No pending requests</p>}
			<div style={{ maxWidth: "300px" }}>
				{pending.map(user => (
					<div 
						key={user.id}
						style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: "8px",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<div className="small-avatar-container">
								<div className="small-avatar">
									<img
										src={user.avatarUrl ? `${API_URL}${user.avatarUrl}` : "/default-avatar.png"}
										alt="Small Avatar"
									/>
								</div>
							</div>
							<Link
								to={`/users/${user.id}`}
								style={{ textDecoration: "none", color: "inherit" }}
							>
								{user.username}
							</Link>
							<div style={{ display: "flex", gap: "8px" }}>
								<button
									className="friend-action-btn"
									onClick={() => handleAccept(user.id)}
									disabled={loading}
								>
									Accept
								</button>
								<button
									className="friend-action-btn"
									onClick={() => handleReject(user.id)}
									disabled={loading}
								>
									Reject
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}