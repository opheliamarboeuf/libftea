import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import './DashboardPage.css';

const DASHBOARD_PAGE_KEY = 'lastDashboardPage';
const DASHBOARD_ADMIN_PAGE_KEY = 'lastDashboardAdminPage';
const DASHBOARD_MOD_PAGE_KEY = 'lastDashboardModPage';

const DashboardPage = () => {
	const { user } = useUser();
	const location = useLocation();
	const navigate = useNavigate();

	// Save the current page in the current key
	useEffect(() => {
		if (location.pathname.startsWith('/dashboard/admin')) {
			localStorage.setItem(DASHBOARD_ADMIN_PAGE_KEY, location.pathname);
			localStorage.setItem(DASHBOARD_PAGE_KEY, location.pathname);
		} else if (location.pathname.startsWith('/dashboard/mod')) {
			localStorage.setItem(DASHBOARD_MOD_PAGE_KEY, location.pathname);
			localStorage.setItem(DASHBOARD_PAGE_KEY, location.pathname);
		}
	}, [location]);

	const isModRoute = location.pathname.startsWith('/dashboard/mod');
	const activeTab = isModRoute ? 'MOD' : 'ADMIN';

	if (!user) return <Navigate to="/" replace />;
	// display Admin Dashboard by default if the user is an Admin
	if (location.pathname === '/dashboard') {
		const lastPage = localStorage.getItem(DASHBOARD_PAGE_KEY);
		const defaultPath =
			user.role === 'ADMIN' ? '/dashboard/admin/users/all' : '/dashboard/mod/users/all';
		const redirectPath = lastPage || defaultPath;
		return <Navigate to={redirectPath} replace />;
	}

	// Get the last page for each session
	const getLastAdminPage = () => {
		return localStorage.getItem(DASHBOARD_ADMIN_PAGE_KEY) || '/dashboard/admin/users/all';
	};

	const getLastModPage = () => {
		return localStorage.getItem(DASHBOARD_MOD_PAGE_KEY) || '/dashboard/mod/users/all';
	};

	// if MOD, no tabs
	if (user.role === 'MOD') {
		return (
			<div className="dashboard-page">
				<div className="dash-board-content">
					<Outlet />
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-page">
			<div className="dashboard-header">
				<div className="dashboard-tabs">
					<div className={`dashboard-tab-indicator ${activeTab}`} />
					<button
						className={activeTab === 'ADMIN' ? 'active' : ''}
						onClick={() => navigate(getLastAdminPage())}
					>
						Administrator Dashboard
					</button>
					<button
						className={activeTab === 'MOD' ? 'active' : ''}
						onClick={() => navigate(getLastModPage())}
					>
						Moderator Dashboard
					</button>
				</div>
			</div>
			<div className="dash-board-content">
				<Outlet />
			</div>
		</div>
	);
};

export default DashboardPage;
