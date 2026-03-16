import { Route } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';
import { ModDashboard } from '../components/ModDashboard';
import { PendingPostReports } from '../components/reports/posts/PendingPostReports';
import { PendingUserReports } from '../components/reports/users/PendingUserReports';
import { MyPostReports } from '../components/reports/posts/MyPostReports';
import { AllAssignedPostReports } from '../components/reports/posts/AllAssignedPostReports';
import { AllHandledPostReports } from '../components/reports/posts/AllHandledPostReports';
import PostReportPage from '../components/reports/posts/PostReportPage';
import { AdminDashboard } from '../components/AdminDashboard';
import { MyUserReports } from '../components/reports/users/MyUserReports';
import UserReportPage from '../components/reports/users/UserReportPage';

export const ModerationRoutes = (
	<>
		<Route path="/dashboard" element={<DashboardPage />}>
			<Route path="admin" element={<AdminDashboard />}>
				<Route path="reports/users/pending" element={<PendingUserReports />} />
				<Route path="reports/users/mine" element={<MyUserReports />} />
				<Route path="reports/users/all/assigned" element={<AllAssignedPostReports />} />
				<Route path="reports/users/all/handled" element={<AllHandledPostReports />} />
			</Route>
			<Route path="mod" element={<ModDashboard />}>
				<Route path="reports/posts/pending" element={<PendingPostReports />} />
				<Route path="reports/posts/mine" element={<MyPostReports />} />
				<Route path="reports/posts/all/assigned" element={<AllAssignedPostReports />} />
				<Route path="reports/posts/all/handled" element={<AllHandledPostReports />} />
			</Route>
		</Route>
		<Route path="/moderation/reports/users/:postId" element={<UserReportPage />} />
		<Route path="/moderation/reports/posts/:postId" element={<PostReportPage />} />
	</>
);
