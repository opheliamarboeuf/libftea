import "./ModDashboard.css"
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function AdminDashboard (){
	const { t } = useTranslation();

	return (
		<div className="mod-layout">
			<aside className="mod-sidebar">
				<nav className="mod-menu">
					<div>
						<strong>{t('dashboard.manage')}</strong>
						<ul>
							<li><NavLink to="/dashboard/admin/users/all">{t('dashboard.users')}</NavLink></li>
							<li><NavLink to="/dashboard/admin/users/all-admin">{t('dashboard.admins')}</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>{t('dashboard.userreports')}</strong>
						<ul>
							<li><NavLink to="/dashboard/admin/reports/users/pending">{t('dashboard.pending')}</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/mine">{t('dashboard.assignedme')}</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/all/assigned">{t('dashboard.assignedall')}</NavLink></li>
							<li><NavLink to="/dashboard/admin/reports/users/all/handled">{t('dashboard.resolved')}</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>{t('dashboard.logs')}</strong>
						<ul>
							<li><NavLink to="/dashboard/admin/logs">{t('dashboard.adminlogs')}</NavLink></li>
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
