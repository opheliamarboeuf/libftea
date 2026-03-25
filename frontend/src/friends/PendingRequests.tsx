import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { usePendingRequests } from './hooks';
import { Link } from 'react-router-dom';
import { useFriendsSocket } from './useFriendsSocket';
import './friends.css';

export function PendingRequests() {
	const { pending, refetch } = usePendingRequests();
	const [loading, setLoading] = useState(false);
	const { refreshUser, user } = useUser();
	const API_URL = import.meta.env.VITE_API_URL;

	const { emit } = useFriendsSocket(user?.id, {
		onRequestAccepted: () => {
			setLoading(false);
			refreshUser();
			refetch();
		},
		onRequestRejected: async () => {
			setLoading(false);
			refreshUser();
			refetch();
		},
	});

	const handleAccept = async (userId: number) => {
		setLoading(true);
		emit('accept_friend_request', { requesterId: userId, addresseId: user?.id });
	};

	const handleReject = async (userId: number) => {
		setLoading(true);
		emit('reject_friend_request', { requesterId: userId, addresseId: user?.id });
	};

	return (
		<div>
			{pending.length === 0 && <p className="friends-empty">No pending requests</p>}
			<div className="friends-list">
				{pending.map((user) => (
					<div key={user.id} className="friend-card">
						<div className="friend-card-info">
							<div className="small-avatar-container">
								<div className="small-avatar">
									<img
										src={
											user.avatarUrl
												? `${API_URL}${user.avatarUrl}`
												: '/default-avatar.png'
										}
										alt="Small Avatar"
									/>
								</div>
							</div>
							<Link
								to={user.bannedAt ? '#' : `/users/${user.id}`}
								style={{
									textDecoration: 'none',
									color: 'inherit',
									cursor: user.bannedAt ? 'default' : 'pointer',
									pointerEvents: user.bannedAt ? 'none' : 'auto',
								}}
							>
								{user.bannedAt ? 'Unknown User' : user.username}
							</Link>
						</div>
						<div className="friend-card-actions">
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
				))}
			</div>
		</div>
	);
}
