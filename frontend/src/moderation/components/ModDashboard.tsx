import "./ModDashboard.css"
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ModDashboard() {
	const { t } = useTranslation();

	return (
		<div className="mod-layout">
			<aside className="mod-sidebar">
				<nav className="mod-menu">
					<div>
						<strong>{t('dashboard.manage')}</strong>
						<ul>
							<li><NavLink to="/dashboard/mod/users/all">{t('dashboard.users')}</NavLink></li>
							<li><NavLink to="/dashboard/mod/users/all-mod">{t('dashboard.mods')}</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>{t('dashboard.postreports')}</strong>
						<ul>
							<li><NavLink to="/dashboard/mod/reports/posts/pending">{t('dashboard.pending')}</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/mine">{t('dashboard.assignedme')}</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/all/assigned">{t('dashboard.assignedall')}</NavLink></li>
							<li><NavLink to="/dashboard/mod/reports/posts/all/handled">{t('dashboard.resolved')}</NavLink></li>
						</ul>
					</div>
					<div>
						<strong>{t('dashboard.logs')}</strong>
						<ul>
							<li><NavLink to="/dashboard/mod/logs">{t('dashboard.modlogs')}</NavLink></li>
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
