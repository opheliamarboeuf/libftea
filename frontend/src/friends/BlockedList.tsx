import { useBlocked } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { Link } from "react-router-dom"
import "./friends.css"

export function BlockedList() {
	const { blocked } = useBlocked();
	const API_URL = "http://localhost:3000";


	return (
		<div>
			<h3>Utilisateurs bloqués</h3>

			<div style={{ maxWidth: "300px" }}>
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
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<div className="small-avatar-container">
							<div className="small-avatar">
								<img
									src={blocked.avatarUrl ? `${API_URL}${blocked.avatarUrl}` : "/default-avatar.png"}
									alt="Small Avatar"
								/>
							</div>
						</div>
					<Link
						to={`/users/${blocked.id}`}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						{blocked.username}
					</Link>
					</div>

					{
						<div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
						<BlockFriendButton userId={blocked.id} />
						</div>
					}
					</div>
				))}
			</div>
		</div>
	);
}