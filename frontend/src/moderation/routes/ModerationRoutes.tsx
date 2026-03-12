import { Route } from "react-router-dom";
import DashboardPage from "../../pages/DashboardPage";
import { ModDashboard } from "../components/ModDashboard";
import { PendingReports } from "../components/reports/posts/PendingReports";
import { MyPostReports } from "../components/reports/posts/MyPostReports";
import { AllAssignedPostReports } from "../components/reports/posts/AllAssignedPostReports";
import { AllHandledPostReports } from "../components/reports/posts/AllHandledPostReports";

export const ModerationRoutes = (
	<Route path="/dashboard" element={<DashboardPage />}>
		<Route path="moderation" element={<ModDashboard />}>
			<Route path="reports/posts/pending" element={<PendingReports />}/>
			<Route path="reports/posts/mine" element={<MyPostReports />}/>
			<Route path="reports/posts/all/assigned" element={<AllAssignedPostReports />}/>
			<Route path="reports/posts/all/handled" element={<AllHandledPostReports />}/>
		</Route>
	</Route>
)