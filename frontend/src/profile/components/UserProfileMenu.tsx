import "./UserProfileMenu.css";
import { FaEllipsisV } from "react-icons/fa";
import { useDropdownMenu } from "../../common/hooks/useDropdownMenu";
import { BlockFriendButton } from "../../friends/BlockFriendButton";
import { ReportUserButton } from "../ReportUserButton";

interface UserProfileMenuProps {
	userId: number,
	onAction: () => Promise<void>;
}

export function UserProfileMenu({ userId, onAction }: UserProfileMenuProps) {

	const {
		menuRef,
		toggleMenu,
		openMenu,
	} = useDropdownMenu();

	return (
		<div className="profile-menu" ref={menuRef}>
			<FaEllipsisV onClick={() => toggleMenu()} />
			{openMenu && (<div className="menu-dropdown">						
				<BlockFriendButton userId={userId} onAction={onAction} />
				<ReportUserButton targetId={userId} onAction={onAction} />
			</div>)}
		</div>
	)
}

