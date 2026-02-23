import { FriendsList, PendingRequests } from "../friends";
import { useTranslation } from 'react-i18next';

import "./FriendsPage.css"
const FriendsPage = () => {
	const { t } = useTranslation();

	return (
		<div className="friends-page">
			<h1>{t('friends.myfriends')}</h1>

			<PendingRequests />

			<hr/>
			
			<FriendsList />
		</div>
	);
};

export default FriendsPage