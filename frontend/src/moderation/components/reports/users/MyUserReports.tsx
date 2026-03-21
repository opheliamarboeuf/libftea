import { useEffect, useState } from "react";
import { moderationApi } from "../../../api";
import { UserReportType } from "../../../types";
import { UserReportList } from "./UserReportList";

export function MyUserReports() {

	const [reports, setReports] = useState<UserReportType[]>([]);

	const load = async () => {
		const data = await moderationApi.fetchMyUserReports();
		setReports(data);
	};

	useEffect(() => {
		load();
	}, []);

	return <UserReportList reports={reports} onUpdate={load} />;
}