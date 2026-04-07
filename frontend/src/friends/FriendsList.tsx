import { useFriends } from './hooks';
import { BlockFriendButton } from './BlockFriendButton';
import { RemoveFriendButton } from './RemoveFriendButton';
import { Link } from 'react-router-dom';
import './friends.css';
import { UserNameWithRole } from '../common/components/UserNameWithRole';
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export function FriendsList() {
	const { friends } = useFriends();
	const { t } = useTranslation();

	return (
		<div>
			{friends.length === 0 && <p className="friends-empty">{t('friends.nofriends')}</p>}
			<div className="friends-list">
				{friends.map((friend) => (
					<div key={friend.id} className="friend-card">
						<div className="friend-card-info">
							<div className="small-avatar-container">
								<div className="small-avatar">
									<img
										src={
											friend.avatarUrl
												? `${API_URL}${friend.avatarUrl}`
												: '/transcendence/default-avatar.jpeg'
										}
										alt="Small Avatar"
									/>
								</div>
							</div>
							<Link
								to={friend.bannedAt ? '#' : `/users/${friend.id}`}
								style={{
									textDecoration: 'none',
									color: 'inherit',
									cursor: friend.bannedAt ? 'default' : 'pointer',
									pointerEvents: friend.bannedAt ? 'none' : 'auto',
								}}
							>
								{friend.bannedAt ? (
									'Unknown User'
								) : (
									<UserNameWithRole
										username={friend.username}
										role={friend.role}
									/>
								)}
							</Link>
						</div>
						<div className="friend-card-actions">
							<BlockFriendButton userId={friend.id} />
							<RemoveFriendButton userId={friend.id} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
