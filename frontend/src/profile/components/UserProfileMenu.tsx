import './UserProfileMenu.css';
import { FaEllipsisV } from 'react-icons/fa';
import { useDropdownMenu } from '../../common/hooks/useDropdownMenu';
import { BlockFriendButton } from '../../friends/BlockFriendButton';
import { ReportUserButton } from '../ReportUserButton';
import { useUser } from '../../context/UserContext';
import { BanUserButton } from '../../moderation/components/BanUserButton';
import { useState } from 'react';

interface UserProfileMenuProps {
	userId: number;
	onAction: () => Promise<void>;
}

export function UserProfileMenu({ userId, onAction }: UserProfileMenuProps) {
	const { user } = useUser();
	const { menuRef, toggleMenu, openMenu } = useDropdownMenu();
	const [showBanConfirm, setShowBanConfirm] = useState(false);

	return (
		<div className="profile-menu" ref={menuRef}>
			<FaEllipsisV onClick={() => toggleMenu()} />
			{openMenu && (
				<div className="menu-dropdown">
					<BlockFriendButton userId={userId} onAction={onAction} />
					<ReportUserButton targetId={userId} onAction={onAction} />
					{user?.role === 'ADMIN' && (
						<BanUserButton
							targetId={userId}
							onAction={onAction}
							showConfirm={showBanConfirm}
							setShowConfirm={setShowBanConfirm}
						/>
					)}
				</div>
			)}
		</div>
	);
}
