import { moderationApi } from '../api';
import { useState, useEffect } from 'react';
import { ModerationLogType } from '../types';
import { useLocation } from 'react-router-dom';

export function ModerationLogs() {
	const [logs, setLogs] = useState<ModerationLogType[]>([]);
	const [loading, setLoading] = useState(false);
	const location = useLocation();

	const isAdminTab = location.pathname.startsWith('/dashboard/admin');

	useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true);
			try {
				// Each role calls its own endpoint
				const data = isAdminTab
						? await moderationApi.fetchAdminLogs()
						: await moderationApi.fetchModLogs();
				setLogs(data);
			} catch (error) {
				console.error('Failed to fetch logs:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchLogs();
	}, [isAdminTab]);

	if (loading) return <p>Loading logs...</p>;

	return (
		<div>
			{logs.length === 0 ? (
				<p>No logs available</p>
			) : (
				<ul>
					{logs.map((log) => (
						<li key={log.id}>
							<strong>{log.action}</strong> by {log.actor.username} on{' '}
							{new Date(log.createdAt).toLocaleString()}
							{log.targetUser && <> | Target User: {log.targetUser.username}</>}
							{log.targetPost && <> | Target Post: {log.targetPost.title}</>}
							{log.targetBattle && <> | Target Battle: {log.targetBattle.theme}</>}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
