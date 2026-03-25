import { useBlocked } from './hooks';
import { BlockFriendButton } from './BlockFriendButton';
import { Link } from 'react-router-dom';
import './friends.css';

export function BlockedList() {
	const { blocked } = useBlocked();
	const API_URL = import.meta.env.VITE_API_URL;


	return (
		<div>
			{blocked.length === 0 && <p className="friends-empty">No blocked users</p>}
			<div className="friends-list">
				{blocked.map((blocked) => (
					<div key={blocked.id} className="friend-card">
						<div className="friend-card-info">
							<div className="small-avatar-container">
								<div className="small-avatar">
									<img
										src={
											blocked.avatarUrl
												? `${API_URL}${blocked.avatarUrl}`
												: '/default-avatar.png'
										}
										alt="Small Avatar"
									/>
								</div>
							</div>
							<Link
								to={blocked.bannedAt ? '#' : `/users/${blocked.id}`}
								style={{
									textDecoration: 'none',
									color: 'inherit',
									cursor: blocked.bannedAt ? 'default' : 'pointer',
									pointerEvents: blocked.bannedAt ? 'none' : 'auto',
								}}
							>
								{blocked.bannedAt ? 'Unknown User' : blocked.username}
							</Link>
						</div>
						<div className="friend-card-actions">
							<BlockFriendButton userId={blocked.id} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
