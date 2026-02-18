import { useFriends } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { RemoveFriendButton } from "./RemoveFriendButton";

export function FriendsList() {
	const { friends } = useFriends();

	return (
		<div>
			<h3>Mes amis</h3>

			{friends.map(friend => (
				<div
				key={friend.id}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					marginBottom: "8px",
				}}
				>
				<span>{friend.username}</span>

				{
					<>
					<BlockFriendButton userId={friend.id} />
					<RemoveFriendButton userId={friend.id} />
					</>
				}
				</div>
			))}
		</div>
	);
}