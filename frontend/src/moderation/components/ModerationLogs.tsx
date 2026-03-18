import { moderationApi } from '../api';
import { useState, useEffect } from 'react';
import { ModerationLogType } from '../types';
import { useLocation } from 'react-router-dom';
import './ModerationLogs.css';

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

	// Resolve the username of the target
	const getTarget = (log: ModerationLogType) => {
		if (log.targetUser) return log.targetUser.username;
		if (log.targetPost) return log.targetPost.author?.username ?? '—';
		if (log.targetBattle) return '—';
		return '—';
	};

	// Resolve the identifier of the target (User #, Post #, Battle #)
	const getId = (log: ModerationLogType) => {
		if (log.targetUser) return `User #${log.targetUser.id}`;
		if (log.targetPost) return `Post #${log.targetPost.id}`;
		if (log.targetBattle) return `Battle #${log.targetBattle.id}`;
		return '—';
	};

	// Resolve the title of a log entry (post title or battle theme)
	const getTitle = (log: ModerationLogType) => {
		if (log.targetPost) return log.targetPost.title;
		if (log.targetBattle) return log.targetBattle.theme;
		return '—';
	};

	if (loading) return <p>Loading logs...</p>;

	return (
		<div className="log-list">
			<div className="log-table-card">
				{/* Header */}
				<div className="log-header">
					<span>Actor</span>
					<span>Action</span>
					<span>Target</span>
					<span>ID</span>
					<span>Title</span>
					<span>Date</span>
				</div>

				{/* Rows */}
				{logs.length === 0 ? (
					<div className="log-empty">No logs available</div>
				) : (
					logs.map((log) => (
						<div key={log.id} className="log-row">
							<span>{log.actor.username}</span>
							<span className="log-action">{log.action}</span>
							<span>{getTarget(log)}</span>
							<span>{getId(log)}</span>
							<span>{getTitle(log)}</span>
							<span className="log-date">
								{new Date(log.createdAt).toLocaleString()}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}