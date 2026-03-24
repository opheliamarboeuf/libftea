import { useState } from 'react';
import { ConfirmDialog } from '../../profile/ConfirmDialog';
import { useUser } from '../../context/UserContext';
import { useModal } from '../../context/ModalContext';
import './TwoFactorAuthentification.css';
import { useTranslation } from 'react-i18next';
export function TwoFactorAuthentification() {
	const { user, refreshUser } = useUser();
	const [showConfirm, setShowConfirm] = useState(false);
	const { showModal } = useModal();
	const { t } = useTranslation();

	const isEnabled = user?.twoFactorEnabled ?? false;

	const handleToggle = () => {
		setShowConfirm(true);
	};

	const handleConfirm = () => {
		setShowConfirm(false);
		void (async () => {
			try {
				const res = await fetch('http://localhost:3000/auth/2fa/settings', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});

				const data = await res.json();
				console.log('response:', res.status, data);
				if (!res.ok) {
					showModal(
						Array.isArray(data.message)
							? data.message[0]
							: data.message || '2FA settings change Failed',
					);
					return;
				}
				refreshUser();
			} catch (err) {
				console.log('Server unreachable');
			}
		})();
	};

	const handleCancel = () => {
		setShowConfirm(false);
	};

	return (
		<div className="container">
			<h2>{t('settings.two')}</h2>

			<p className="description">
				{t('settings.twodes')}
			</p>
			<p className="description-large">
				{t('settings.tworecommend')}
			</p>

			<div className="toggle-container">
				<span className="toggle-label">
					{t('settings.currently')}<strong>{isEnabled ? t('settings.enabled') : t('settings.disabled')}</strong>
				</span>

				{/* Toggle */}
				<div
					onClick={handleToggle}
					className={`toggle-switch ${isEnabled ? 'enabled' : ''}`}
				>
					<div className="toggle-indicator" />
				</div>
			</div>

			{showConfirm && (
				<ConfirmDialog
					message={
						isEnabled
							? t('settings.disableconfirm')
							: t('settings.enableconfirm')
					}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
}
