import { Route } from "react-router-dom";
import DashboardPage from "../../pages/DashboardPage";
import { ModDashboard } from "../components/ModDashboard";
import { PendingReports } from "../components/reports/posts/PendingReports";
import { MyPostReports } from "../components/reports/posts/MyPostReports";

export const ModerationRoutes = (
	<Route path="/dashboard" element={<DashboardPage />}>
		<Route path="moderation" element={<ModDashboard />}>
			<Route path="reports/posts/pending" element={<PendingReports />}/>
			<Route path="reports/posts/mine" element={<MyPostReports />}/>
		</Route>
	</Route>
)