import { useTranslation } from 'react-i18next';
import './UserNameWithRole.css';
import { FaStar, FaRegStar } from 'react-icons/fa';

export type UserRole = 'ADMIN' | 'MOD' | 'USER' | string;

interface UserNameWithRoleProps {
	username: string;
	role?: UserRole;
	className?: string;
}

export function UserNameWithRole({ username, role, className = '' }: UserNameWithRoleProps) {
	const normalizedRole = (role?.toString() || '').trim().toUpperCase();
	const { t } = useTranslation();

	const isAdmin = normalizedRole === 'ADMIN';
	const isMod = normalizedRole === 'MOD';

	const icon = isAdmin ? <FaStar /> : isMod ? <FaRegStar /> : null;
	const title = isAdmin ? 'Admin' : isMod ? 'Moderator' : '';

	return (
		<span className={`user-role-username ${className}`}>
			<span>{username || t('userreport.unknown')}</span>
			{icon && (
				<span className="user-role-icon" title={title}>
					{icon}
				</span>
			)}
		</span>
	);
}
