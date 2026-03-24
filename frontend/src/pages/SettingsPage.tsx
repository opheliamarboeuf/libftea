import { Outlet, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import './SettingsPage.css';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const { t } = useTranslation();

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="settings-page">
			<aside className="settings-sidebar">
				<nav className="mod-menu">
				<strong>{t('settings.security')}</strong>
				<ul>
					<li>
						<NavLink to="/settings/2FA">{t('settings.2fa')}</NavLink>
					</li>
					<strong>{t('settings.legal')}</strong>
					<li>
						<NavLink to="/settings/terms">{t('common.terms')}</NavLink>
						<NavLink to="/settings/privacy">{t('common.privacy')}</NavLink>
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
