import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import { useTranslation } from "react-i18next";

const URL = 'http://localhost:3000/users';
const API_URL = 'http://localhost:3000';

interface SearchResult {
	id: number;
	username: string;
	role?: 'ADMIN' | 'MOD' | 'USER' | string;
	avatarUrl?: string;
}

import { UserNameWithRole } from './UserNameWithRole';

export const SearchBar = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [showResults, setShowResults] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		const searchUsers = async () => {
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`${URL}/search?username=${query}`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (res.ok) {
					const data = await res.json();
					setResults(data);
					setShowResults(true);
				}
			} catch (err) {
				console.error('Search error:', err);
			}
		};

		const timeoutId = setTimeout(searchUsers, 300);
		return () => clearTimeout(timeoutId);
	}, [query]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowResults(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelectUser = (userId: number) => {
		navigate(`/users/${userId}`);
		setQuery('');
		setShowResults(false);
	};

	return (
		<div className="search-container" ref={searchRef}>
			<input
				type="text"
				placeholder={t('searchbar.search')}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={() => setShowResults(true)}
				className="search-input"
			/>
			{showResults && results.length > 0 && (
				<div className="search-results">
					{results.map((user) => (
						<div
							key={user.id}
							className="search-result-item"
							onClick={() => handleSelectUser(user.id)}
						>
							{user.avatarUrl && (
								<img
									src={`${API_URL}${user.avatarUrl}`}
									alt={user.username}
									className="search-avatar"
								/>
							)}
							<span className="search-username">
								<UserNameWithRole username={user.username} role={user.role} />
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
