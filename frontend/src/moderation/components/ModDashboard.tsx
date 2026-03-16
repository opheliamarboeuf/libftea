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
							<li><NavLink to="/dashboard/mod/users/all">All Users</NavLink></li>
							<li><NavLink to="/dashboard/mod/users/all-mod">Moderators</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>Post Reports</strong>
						<ul>
							<li><NavLink to="/dashboard/mod/reports/posts/pending">Pending reports</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/mine">Assigned to me</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/all/assigned">All assigned reports</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/all/handled">Resolved</NavLink></li>
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
