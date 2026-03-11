import { useEffect, useState } from "react";
import { moderationApi } from "../../../api";
import { PostReportType } from "../../../types";
import { PostReportList } from "./PostReportList";

export function MyPostReports() {

	const [reports, setReports] = useState<PostReportType[]>([]);

	useEffect(() => {
		const load = async () => {
			const data = await moderationApi.fetchMyPostReports();
			setReports(data);
		};

		load();
	}, []);

	return <PostReportList reports={reports} />;
}