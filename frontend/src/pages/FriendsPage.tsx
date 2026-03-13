import { FriendsList, PendingRequests, BlockedList } from "../friends";
import "./FriendsPage.css"
import { useState } from "react";
import { useTranslation } from "react-i18next";

const FriendsPage = () => {
	const [friendsType, setFriendsType] = useState("friends");
	const { t } = useTranslation();

	return (
		<div className="friends-page">
			<div className="friends-header">
				<div className="page-name">{t('friends.myfriends')}</div>
				<div className="friends-tabs">
					<div
						className={`friends-tab-indicator ${friendsType }`}
					/>
					<button
						className={friendsType === "friends" ? "active" : "" }
						onClick={() => setFriendsType("friends")}
					>
						{t('feedpage.friends')}
					</button>
					<button
						className={friendsType === "pending" ? "active" : "" }
						onClick={() => setFriendsType("pending")}
					>
						{t('friends.prequests')}
					</button>
					<button
						className={friendsType === "blocked" ? "active" : "" }
						onClick={() => setFriendsType("blocked")}
					>
						{t('friends.blockedusers')}
					</button>
					
				</div>
			</div>
			<div className="friends-content">
				{friendsType === "friends" && <FriendsList />}
				{friendsType === "pending" && <PendingRequests />}
				{friendsType === "blocked" && <BlockedList />}
			</div>
		</div>
	);
};

export default FriendsPage