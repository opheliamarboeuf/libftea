import { Route } from 'react-router-dom';
import SettingsPage from '../pages/SettingsPage';
import { TwoFactorAuthentification } from './components/TwoFactorAuthentification';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';

export const SettingsRoutes = (
	<>
		<Route path="/settings" element={<SettingsPage />}>
			<Route path="2FA" element={<TwoFactorAuthentification />} />
			<Route path="terms" element={<TermsPage />} />
			<Route path="privacy" element={<PrivacyPage />} />
		</Route>
	</>
);
