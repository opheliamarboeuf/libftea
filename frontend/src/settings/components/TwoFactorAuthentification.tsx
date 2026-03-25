import { useState } from 'react';
import { ConfirmDialog } from '../../profile/ConfirmDialog';
import { useUser } from '../../context/UserContext';
import { useModal } from '../../context/ModalContext';
import './TwoFactorAuthentification.css';

const API_URL = import.meta.env.VITE_API_URL;

export function TwoFactorAuthentification() {
	const { user, refreshUser } = useUser();
	const [showConfirm, setShowConfirm] = useState(false);
	const { showModal } = useModal();

	const isEnabled = user?.twoFactorEnabled ?? false;

	const handleToggle = () => {
		setShowConfirm(true);
	};

	const handleConfirm = () => {
		setShowConfirm(false);
		void (async () => {
			try {
				const res = await fetch(`${API_URL}/auth/2fa/settings`, {
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
			<h2>Two-Factor Authentication</h2>

			<p className="description">
				Two-factor authentication adds an extra layer of security to your account. When
				enabled, you will be asked to enter a verification code sent to your email each time
				you log in.
			</p>
			<p className="description-large">
				We recommend enabling 2FA to protect your account from unauthorized access.
			</p>

			<div className="toggle-container">
				<span className="toggle-label">
					2FA is currently <strong>{isEnabled ? 'enabled' : 'disabled'}</strong>
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
							? 'Are you sure you want to disable two-factor authentication? Your account will be less secure.'
							: 'Are you sure you want to enable two-factor authentication? You will receive a code by email at each login.'
					}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
}
