import { FriendsList, PendingRequests, BlockedList } from "../friends";
import { useTranslation } from 'react-i18next';

import "./FriendsPage.css"
import { useState } from "react";

const FriendsPage = () => {
	const [friendsType, setFriendsType] = useState("friends");
	const { t } = useTranslation();

	return (
		<div className="friends-page">
			<div className="friends-header">
				<div className="page-name">My friends</div>
				<div className="friends-tabs">
					<div
						className={`friends-tab-indicator ${friendsType }`}
					/>
					<button
						className={friendsType === "friends" ? "active" : "" }
						onClick={() => setFriendsType("friends")}
					>
						Friends
					</button>
					<button
						className={friendsType === "pending" ? "active" : "" }
						onClick={() => setFriendsType("pending")}
					>
						Requests
					</button>
					<button
						className={friendsType === "blocked" ? "active" : "" }
						onClick={() => setFriendsType("blocked")}
					>
						Blocked Users
					</button>
					
				</div>
			</div>
			<div className="friends-content">
				{friendsType === "friends" && <FriendsList />}
				{friendsType === "pending" && <PendingRequests />}
				{friendsType === "blocked" && <BlockedList />}
			</div>
			<h1>{t('friends.myfriends')}</h1>

			<PendingRequests />

			<hr/>
			
			<FriendsList />
		</div>
	);
};

export default FriendsPage