import { moderationApi } from "../api";
import { useState, useEffect } from "react";
import { ModerationLogType } from "../types";


export function ModerationLogs () {
	const [logs, setLogs] = useState<ModerationLogType[]>([]);
	const [loading, setLoading] = useState(false);
	
	const getAdminLogs = async () => {
		setLoading(true);
		try {
			const logs = await moderationApi.fetchAdminLogs();
			setLogs(logs);
		}
		catch(error) {
			console.log("Failed to fetch admin logs:", error);
		}
		finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getAdminLogs();
	}, []);
	
	if (loading) return <p>Loading logs...</p>;

	return (
		<div>
			{logs.length === 0 ? (<p>No logs available</p>) : 
			(
				<ul>
					{logs.map((log) => (
						<li key={log.id}>
							<strong>{log.action}</strong> by {log.actor.username} on{" "}
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