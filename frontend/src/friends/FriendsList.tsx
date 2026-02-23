import { useFriends } from "./hooks";
import { useTranslation } from 'react-i18next';

export function FriendsList() {
	const { friends } = useFriends();
	const { t } = useTranslation();

	return (
		<div>
			<h3>{t('friends.myfriends')}</h3>

			{friends.map(friend => (
				<div key={friend.id}>
					{friend.username}
				</div>
			))}
		</div>
	);
}