import { Outlet, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import './SettingsPage.css';

const SettingsPage = () => {
	const navigate = useNavigate();
	const { user } = useUser();

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="settings-page">
			<aside className="settings-sidebar">
				<nav className="mod-menu">
				<strong>Security</strong>
				<ul>
					<li>
						<NavLink to="/settings/2FA">2FA</NavLink>
					</li>
					<strong>Preference</strong>
					<li>
						<NavLink to="/settings/language">Language</NavLink>
					</li>
					<strong>Legal</strong>
					<li>
						<NavLink to="/settings/privacy">Terms and Conditions</NavLink>
					</li>
				</ul>
				</nav>
			</aside>
			<main className="settings-content">
				<Outlet />
			</main>
		</div>
	);
};

export default SettingsPage;
