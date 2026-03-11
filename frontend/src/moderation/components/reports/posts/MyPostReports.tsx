import { useEffect, useState } from "react";
import { moderationApi } from "../../../api";
import { PostReportType } from "../../../types";
import { PostReportList } from "./PostReportList";

export function MyPostReports() {

	const [reports, setReports] = useState<PostReportType[]>([]);

	const load = async () => {
		const data = await moderationApi.fetchMyPostReports();
		setReports(data);
	};

	useEffect(() => {
		load();
	}, []);

	return <PostReportList reports={reports} onUpdate={load} />;
}