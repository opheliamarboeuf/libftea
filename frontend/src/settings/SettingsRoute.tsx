import { Route } from 'react-router-dom';
import SettingsPage from '../pages/SettingsPage';
import { TwoFactorAuthentification } from './components/TwoFactorAuthentification';

export const SettingsRoutes = (
	<>
		<Route path="/settings" element={<SettingsPage />}>
			<Route path="2FA" element={<TwoFactorAuthentification />} />
		</Route>
	</>
);
