import { useBlocked } from "./hooks";
import { BlockFriendButton } from "./BlockFriendButton";
import { Link } from "react-router-dom"
import "./friends.css"
import { useTranslation } from "react-i18next";

export function BlockedList() {
	const { blocked } = useBlocked();
	const API_URL = "http://localhost:3000";
	const { t } = useTranslation();

	return (
		<div>
			{blocked.length === 0 && <p>{t("friends.noblocked")}</p>}
				{blocked.map(blocked => (
					<div
					key={blocked.id}
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: "8px",
						gap: "8px",
					}}
			>
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
				<div style={{ display: "flex", gap: "8px" }}>
					<BlockFriendButton userId={blocked.id} />
				</div>
				</div>
				))}
		</div>
	);
}