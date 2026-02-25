import { useBlocked } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { Link } from "react-router-dom"

export function BlockedList() {
	const { blocked } = useBlocked();

	return (
		<div>
			<h3>Utilisateurs bloqués</h3>

			{blocked.map(blocked => (
				<div
				key={blocked.id}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "20px",
					marginBottom: "8px",
				}}
				>
				<Link
					to={`/users/${blocked}`}
					style={{ textDecoration: "none", color: "inherit" }}
				>
					{blocked.username}
				</Link>

				{
					<>
					<BlockFriendButton userId={blocked.id} />
					</>
				}
				</div>
			))}
		</div>
	);
}