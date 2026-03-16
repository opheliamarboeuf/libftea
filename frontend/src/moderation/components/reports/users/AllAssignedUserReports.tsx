import { useEffect, useState } from "react";
import { moderationApi } from "../../../api";
import { UserReportType } from "../../../types";
import { UserReportList } from "./UserReportList";

export function AllAssignedUserReports() {

	const [reports, setReports] = useState<UserReportType[]>([]);

	const load = async () => {
		const data = await moderationApi.fetchAllAssignedUserReports();
		setReports(data);
	};

	useEffect(() => {
		load();
	}, []);

	return <UserReportList reports={reports} onUpdate={load} />;
}