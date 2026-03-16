import "./ModDashboard.css"
import { Outlet, NavLink } from "react-router-dom";

export function AdminDashboard (){
	return (
		<div className="mod-layout">
			<aside className="mod-sidebar">
				<nav className="mod-menu">
					<div>
						<strong>Users Management</strong>
						<ul>
							<li><NavLink to="/dashboard/admin/users/all">All Users</NavLink></li>
							<li><NavLink to="/dashboard/admin/users/all-admin">Administrators</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>User Reports</strong>
						<ul>
							<li><NavLink to="/dashboard/admin/reports/users/pending">Pending reports</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/mine">Assigned to me</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/all/assigned">All assigned reports</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/all/handled">Resolved</NavLink></li>
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
