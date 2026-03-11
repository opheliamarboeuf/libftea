import { useEffect, useState } from "react";
import { moderationApi } from "../../../api";
import { PostReportType } from "../../../types";
import { PostReportList } from "./PostReportList";

export function PendingReports() {

	const [reports, setReports] = useState<PostReportType[]>([]);

	useEffect(() => {
		const load = async () => {
			const data = await moderationApi.fetchPendingPostReport();
			setReports(data);
		};

		load();
	}, []);

	return <PostReportList reports={reports} />;
}