import { useFriends } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { RemoveFriendButton } from "./RemoveFriendButton";
import { Link } from "react-router-dom"
import "./friends.css"

export function FriendsList() {
	const { friends } = useFriends();
	const API_URL = "http://localhost:3000";

	return (
		<div>
			<h3>My friends</h3>
			<div style={{ maxWidth: "300px" }}>
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
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div className="small-avatar-container">
						<div className="small-avatar">
							<img
								src={friend.avatarUrl ? `${API_URL}${friend.avatarUrl}` : "/default-avatar.png"}
								alt="Small Avatar"
							/>
						</div>
					</div>
					<Link
						to={`/users/${friend.id}`}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						{friend.username}
					</Link>
					</div>

					{
						<div style={{ display: "flex", gap: "8px", marginLeft: "auto"}}>
						<BlockFriendButton userId={friend.id} />
						<RemoveFriendButton userId={friend.id} />
						</div>
					}
					</div>
				))}
			</div>
		</div>
	);
}