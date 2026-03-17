import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModerationUser } from './types';
import './UserList.css';

interface UserListProps {
	users: ModerationUser[];
	onUpdate?: () => void;
}

type SortField = 'id' | 'username' | 'role' | 'status';

export function UserList({ users: initialUsers }: UserListProps) {
	const navigate = useNavigate();

	const [sortField, setSortField] = useState<SortField>('id');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [searchTerm, setSearchTerm] = useState('');

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
		// 1. Filtre local sur initialUsers
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
				</div>

				{filteredAndSortedUsers.length === 0 ? (
					<div className="user-empty">No users found</div>
				) : (
					filteredAndSortedUsers.map((user) => (
						<div key={user.id} className="user-row">
							<span>{user.id}</span>

							{/* Username cliquable */}
							<span
								className="user-username-clickable"
								onClick={() => goToProfile(user.id)}
							>
								{user.username}
							</span>

							<span>{user.role}</span>
							<span className={user.bannedAt ? 'status-banned' : 'status-active'}>
								{user.bannedAt ? 'BANNED' : 'ACTIVE'}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}
