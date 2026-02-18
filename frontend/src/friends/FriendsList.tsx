import { useFriends } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { RemoveFriendButton } from "./RemoveFriendButton";
import { Link } from "react-router-dom"

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
					gap: "20px",
					marginBottom: "8px",
				}}
				>
				<Link
					to={`/users/${friend.id}`}
					style={{ textDecoration: "none", color: "inherit" }}
				>
					{friend.username}
				</Link>

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