import { PostReportList } from "./PostReportList";
import { useState, useEffect } from "react";
import { moderationApi } from "../api";
import { PostReportType } from "../types";

export function ModDashboard (){
	
	const [reports, setReports] = useState<PostReportType[]>([]);
	
		const loadPosts = async () => {
			const data =  await moderationApi.fetchPendingPostReport();
			setReports(data);
		}
	
		useEffect(() => {
			loadPosts();
		}, []);
		

	return (
		<div className="">
			<PostReportList reports = {reports}/>
		</div>
	)
}