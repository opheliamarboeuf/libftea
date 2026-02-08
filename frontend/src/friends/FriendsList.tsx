import { useFriends } from "./hooks";

export function FriendsList() {
	const { friends } = useFriends();

	return (
		<div>
			<h3>Mes amis</h3>

			{friends.map(friend => (
				<div key={friend.id}>
					{friend.username}
				</div>
			))}
		</div>
	);
}