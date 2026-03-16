import { useNavigate } from 'react-router-dom';
import { ModerationUser } from './types';
import { useState } from 'react';
import './UserList.css';

interface UserListProps {
	users: ModerationUser[];
	onUpdate?: () => void;
}

type SortField = 'id' | 'username' | 'role' | 'status';

export function UserList({ users }: UserListProps) {
	const navigate = useNavigate();

	const [sortField, setSortField] = useState<SortField>('id');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

	// Create a new sorted array of users
	const sortedUsers = [...users].sort((a, b) => {
		let result = 0;

		if (sortField === 'id') {
			result = a.id - b.id; // smaller ID comes first
		}
		// Sorting by username (alphabetical)
		if (sortField === 'username') {
			result = a.username.localeCompare(b.username);
		}

		// Sorting by role with custom priority: ADMIN > MOD > USER
		if (sortField === 'role') {
			const roleOrder = { ADMIN: 3, MOD: 2, USER: 1 };
			result =
				roleOrder[a.role as keyof typeof roleOrder] -
				roleOrder[b.role as keyof typeof roleOrder];
		}

		// Sorting by role with custom priority: ADMIN > MOD > USER
		if (sortField === 'status') {
			const statusA = a.bannedAt ? 1 : 0;
			const statusB = b.bannedAt ? 1 : 0;
			result = statusA - statusB;
		}
		
		// If the sort direction is descending, invert the result
		return sortDirection === 'asc' ? result : -result;
	});

	if (!Array.isArray(users) || users.length === 0) {
		return <div className="user-list">No users found</div>;
	}

	return (
		<div className="user-list">
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
			{sortedUsers.map((user) => (
				<div key={user.id} className="user-row" onClick={() => goToProfile(user.id)}>
					<span>{user.id}</span>
					<span>{user.username}</span>
					<span>{user.role}</span>
					<span>{user.bannedAt ? 'BANNED' : 'ACTIVE'}</span>
				</div>
			))}
		</div>
	);
}
