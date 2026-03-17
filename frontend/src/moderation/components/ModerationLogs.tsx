import { moderationApi } from "../api";
import { useState, useEffect } from "react";
import { ModerationLogType } from "../types";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";


export function ModerationLogs () {
	const [logs, setLogs] = useState<ModerationLogType[]>([]);
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	
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
	
	if (loading) return <p>{t('moderationlogs.loadinglogs')}</p>;

	return (
		<div>
			<h2>{t('moderationlogs.logs')}</h2>
			{logs.length === 0 ? (<p>{t('moderationlogs.nologs')}</p>) : 
			(
				<ul>
					{logs.map((log) => (
						<li key={log.id}>
							<Trans
								i18nKey="moderationlogs.action"
								values={{
									action: log.action,
									username: log.actor.username,
									date: new Date(log.createdAt).toLocaleString(),
								}}
								components={[<strong key="0" />]}
							/>
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