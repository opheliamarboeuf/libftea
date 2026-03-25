import { useBlocked } from './hooks';
import { BlockFriendButton } from './BlockFriendButton';
import { Link } from 'react-router-dom';
import './friends.css';
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export function BlockedList() {
	const { blocked } = useBlocked();
	const { t } = useTranslation();

>>>>>>> main

	return (
		<div>
			{blocked.length === 0 && <p className="friends-empty">{t("friends.noblocked")}</p>}
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
								{blocked.bannedAt ? t('userreport.unknown') : blocked.username}
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
