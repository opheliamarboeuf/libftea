import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModerationUser } from './types';
import { useUser } from '../../context/UserContext';
import { ConfirmDialog } from '../../common/components/ConfirmDialog';
import { UserNameWithRole } from '../../common/components/UserNameWithRole';
import { useModal } from '../../context/ModalContext';
import { moderationApi } from '../api';
import './UserList.css';

interface UserListProps {
	users: ModerationUser[];
	onUpdate?: () => void;
}

type SortField = 'id' | 'username' | 'role' | 'status';

// Pending action before confirmation
interface PendingAction {
	userId: number;
	type: 'admin' | 'mod';
	message: string;
}

export function UserList({ users: initialUsers, onUpdate }: UserListProps) {
	const navigate = useNavigate();
	const { user: currentUser } = useUser();
	const { showModal } = useModal();

	const [sortField, setSortField] = useState<SortField>('id');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [searchTerm, setSearchTerm] = useState('');
	const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	const handleSort = (field: SortField) => {
		// If the user clicked the same column that's already sorted
		if (field === sortField) {
			// Reverse the sort direction (asc -> desc, desc -> asc)
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// If a new column is clicked, switch to sorting by that column
			setSortField(field);
			// Default
			setSortDirection('asc');
		}
	};

	const filteredAndSortedUsers = useMemo(() => {
		// 1. Local filter on initialUsers
		const filtered =
			searchTerm.length < 2
				? initialUsers
				: initialUsers.filter((u) =>
						u.username.toLowerCase().includes(searchTerm.toLowerCase()),
					);

		// Create a new sorted array of users
		return [...filtered].sort((a, b) => {
			let result = 0;

			if (sortField === 'id') {
				result = a.id - b.id; // smaller ID comes first
			}
			// Sorting by username (alphabetical)
			else if (sortField === 'username') {
				result = a.username.localeCompare(b.username);
			}

			// Sorting by role with custom priority: ADMIN > MOD > USER
			else if (sortField === 'role') {
				const roleOrder = { ADMIN: 3, MOD: 2, USER: 1 };
				result =
					roleOrder[a.role as keyof typeof roleOrder] -
					roleOrder[b.role as keyof typeof roleOrder];
			}

			// Sorting by status with custom priority: BANNED > ACTIVE
			else if (sortField === 'status') {
				const statusA = a.bannedAt ? 1 : 0;
				const statusB = b.bannedAt ? 1 : 0;
				result = statusA - statusB;
			}

			// If the sort direction is descending, invert the result
			return sortDirection === 'asc' ? result : -result;
		});
	}, [initialUsers, searchTerm, sortField, sortDirection]);

	// Build action buttons for a given target user
	const getActionButtons = (target: ModerationUser) => {
		// No actions on yourself
		if (target.id === currentUser?.id) return null;

		// Array used to collect all action buttons dynamically based on roles/permissions
		const buttons: React.ReactNode[] = [];

		if (target.bannedAt)
			return;

		if (currentUser?.role === 'ADMIN') {
			// ADMIN can toggle MOD <-> ADMIN
			if (target.role === 'MOD') {
				buttons.push(
					<button
						key="admin"
						className="action-btn promote"
						onClick={(e) => {
							e.stopPropagation();
							setPendingAction({
								userId: target.id,
								type: 'admin',
								message: `Promote ${target.username} to ADMIN?`,
							});
						}}
					>
						→ ADMIN
					</button>,
				);
			}
			// ADMIN can toggle USER <-> MOD
			if (target.role === 'USER' || target.role === 'MOD') {
				buttons.push(
					<button
						key="mod"
						className={`action-btn ${target.role === 'USER' ? 'promote' : 'demote'}`}
						onClick={(e) => {
							e.stopPropagation();
							// to open Confirmation Modal
							setPendingAction({
								userId: target.id,
								type: 'mod',
								message:
									target.role === 'USER'
										? `Promote ${target.username} to MOD?`
										: `Demote ${target.username} to USER?`,
							});
						}}
					>
						{target.role === 'USER' ? '→ MOD' : '→ USER'}
					</button>,
				);
			}
		} else if (currentUser?.role === 'MOD') {
			// MOD can toggle USER <-> MOD
			if (target.role === 'USER' || target.role === 'MOD') {
				buttons.push(
					<button
						key="mod"
						className={`action-btn ${target.role === 'USER' ? 'promote' : 'demote'}`}
						onClick={(e) => {
							e.stopPropagation();
							setPendingAction({
								userId: target.id,
								type: 'mod',
								message:
									target.role === 'USER'
										? `Promote ${target.username} to MOD?`
										: `Demote ${target.username} to USER?`,
							});
						}}
					>
						{target.role === 'USER' ? '→ MOD' : '→ USER'}
					</button>,
				);
			}
		}

		// Render the action buttons container only if at least one button exists, otherwise render nothing
		return buttons.length > 0 ? <div className="action-buttons">{buttons}</div> : null;
	};

	// Execute the confirmed action
	const handleConfirmAction = async () => {
		if (!pendingAction) return;
		try {
			if (pendingAction.type === 'admin') {
				await moderationApi.changeAdminRole(pendingAction.userId);
			} else {
				await moderationApi.changeModRole(pendingAction.userId);
			}
			onUpdate?.();
		} catch (error: any) {
			showModal(error.message || 'An error occurred');
		} finally {
			setPendingAction(null);
		}
	};

	if (!Array.isArray(initialUsers) || initialUsers.length === 0) {
		return <div className="user-list">No users found</div>;
	}

	return (
		<div className="user-list">
			{/* Search bar */}
			<div className="user-search">
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{/* Table card: header + rows grouped in one card */}
			<div className="user-table-card">
				<div className="user-header">
					<span onClick={() => handleSort('id')}>
						ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
					</span>
					<span onClick={() => handleSort('username')}>
						Username {sortField === 'username' && (sortDirection === 'asc' ? '▲' : '▼')}
					</span>
					<span onClick={() => handleSort('role')}>
						Role {sortField === 'role' && (sortDirection === 'asc' ? '▲' : '▼')}
					</span>
					<span onClick={() => handleSort('status')}>
						Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
					</span>
					<span>Actions</span>
				</div>

				{filteredAndSortedUsers.length === 0 ? (
					<div className="user-empty">No users found</div>
				) : (
					filteredAndSortedUsers.map((user) => (
						<div key={user.id} className="user-row">
							<span>{user.id}</span>
							<span
								className="user-username-clickable"
								onClick={() => goToProfile(user.id)}
							>
									<UserNameWithRole username={user.username} role={user.role} />
							</span>
							<span>{user.role}</span>
							<span className={user.bannedAt ? 'status-banned' : 'status-active'}>
								{user.bannedAt ? 'BANNED' : 'ACTIVE'}
							</span>
							<span>{getActionButtons(user)}</span>
						</div>
					))
				)}
			</div>

			{/* Confirmation dialog */}
			{pendingAction && (
				<ConfirmDialog
					message={pendingAction.message}
					onConfirm={handleConfirmAction}
					onCancel={() => setPendingAction(null)}
				/>
			)}
		</div>
	);
}
