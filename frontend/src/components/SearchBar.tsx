import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const URL = 'http://localhost:3000/user';

interface SearchResult {
	id: number;
	username: string;
	avatarUrl?: string;
}

export const SearchBar = () => {
	const [query, setQuery ] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [showResults, setShowResults] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		const SearchUsers = async () => {
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`${URL}/search?username=${query}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
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

		const timeoutId = setTimeout(SearchUsers, 300);
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
		navigate(`/user/${userId}`);
		setQuery('');
		setShowResults(false);
	};

	return (
		<div ref={searchRef} style={{ position: 'relative', display: 'inline-block' }}>
			<input
				type="text"
				placeholder="Rechercher..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={() => setShowResults(true)}
				style={{
					padding: '8px 12px',
					border: '1px solid #ccc',
					borderRadius: '4px',
					width: '250px',
					color: '#212529',
					backgroundColor: 'white',
				}}></input>

				{showResults && results.length > 0 && (
					<div
						style={{
							position: 'absolute',
							top: '100%',
							left: 0,
							right: 0,
							backgroundColor: 'white',
							border: '1px solid #ccc',
							borderRadius: '4px',
							marginTop: '4px',
							maxHeight: '300px',
							overflowY: 'auto',
							boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
							zIndex: 1000,
						}}>
							{results.map((user) => (
								<div
									key={user.id}
									onClick={() => handleSelectUser(user.id)}
									style={{
										padding: '10px',
										cursor: 'pointer',
										borderBottom: '1px solid #eee',
										display: 'flex',
										alignItems: 'center',
										gap: '10px',
									}}
									onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
             						onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
									>
										{user.avatarUrl && (
											<img
												src={user.avatarUrl}
												alt={user.username}
												style={{
													width: '30px',
													height: '30px',
													borderRadius: '50%',
													objectFit: 'cover',
												}}
											/>
										)}
										<span style={{ color: '#212529'}}>
											{user.username}
										</span>
									</div>
							))}
						</div>
				)}

		</div>
	);
};