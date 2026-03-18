import './UserNameWithRole.css';
import { FaStar, FaCrown } from 'react-icons/fa';

export type UserRole = 'ADMIN' | 'MOD' | 'USER' | string;

interface UserNameWithRoleProps {
	username: string;
	role?: UserRole;
	className?: string;
}

export function UserNameWithRole({ username, role, className = '' }: UserNameWithRoleProps) {
	const normalizedRole = (role?.toString() || '').trim().toUpperCase();

	const isAdmin = normalizedRole === 'ADMIN';
	const isMod = normalizedRole === 'MOD';

	const icon = isAdmin ? <FaCrown /> : isMod ? <FaStar /> : null;
	const title = isAdmin ? 'Admin' : isMod ? 'Moderator' : '';

	return (
		<span className={`user-role-username ${className}`}>
			<span>{username || 'Unknown User'}</span>
			{icon && (
				<span className="user-role-icon" title={title}>
					{icon}
				</span>
			)}
		</span>
	);
}
