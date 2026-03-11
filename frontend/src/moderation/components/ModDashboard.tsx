import "./ModDashboard.css"
import { Outlet, NavLink } from "react-router-dom";

export function ModDashboard() {

	return (
		<div className="mod-layout">
			<aside className="mod-sidebar">
				<nav className="mod-menu">
					<div>
						<strong>Users Management</strong>
						<ul>
							<li><NavLink to="/dashboard/moderation/users">All Users</NavLink></li>
							<li><NavLink to="/dashboard/moderation/moderators">Moderators</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>Post Reports</strong>
						<ul>
							<li><NavLink to="/dashboard/moderation/reports/posts/pending">Pending reports</NavLink></li>
							<li><NavLink to="/dashboard/moderation/reports/posts/mine">Assigned to me</NavLink></li>
							<li>Assigned to others</li>
							<li>Resolved</li>
						</ul>
					</div>
					<div>
						<strong>Logs</strong>
						<ul>
							<li>View Logs</li>
						</ul>
					</div>
				</nav>
			</aside>

			<main className="mod-content">
				<Outlet/>
			</main>

		</div>
	);
}
