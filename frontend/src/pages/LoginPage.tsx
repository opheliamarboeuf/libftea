import '../App.css';
import './LoginPage.css';
import { useState, ChangeEvent } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
	// Form state
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	// Error + 2FA state handling
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [show2FA, setShow2FA] = useState(false);
	const [twoFactorCode, setTwoFactorCode] = useState('');
	const [pendingUserId, setPendingUserId] = useState<number | null>(null);
	const { setUser } = useUser();
	const navigate = useNavigate();

	const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

	// Fetch full user profile after receiving JWT token
	const fetchAndSetUser = async (token: string) => {
		const res = await fetch('http://localhost:3000/auth/me', {
			headers: { Authorization: `Bearer ${token}` },
		});
		const fullUserData = await res.json();
		setUser(fullUserData);
		navigate('/feed', { replace: true });
	};

	// Handle login form submit
	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			const res = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			// Handle backend validation / auth errors
			if (!res.ok) {
				setErrorMessage(
					Array.isArray(data.message) ? data.message[0] : data.message || 'Login Failed',
				);
				return;
			}

			// If backend requires 2FA, switch UI state instead of logging in
			if (data.twoFactorRequired) {
				setPendingUserId(data.userId);
				setShow2FA(true);
				return;
			}

			// Store JWT and fetch user data
			localStorage.setItem('token', data.access_token);
			await fetchAndSetUser(data.access_token);
		} catch (err) {
			console.log('Server unreachable');
		}
	};

	// Handle 2FA verification submit
	const handle2FASubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			const res = await fetch('http://localhost:3000/auth/2fa/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: pendingUserId, code: twoFactorCode }),
			});

			const data = await res.json();

			if (!res.ok) {
				setErrorMessage(
					Array.isArray(data.message) ? data.message[0] : data.message || 'Invalid code',
				);
				return;
			}

			// Store JWT and complete login
			localStorage.setItem('token', data.access_token);
			await fetchAndSetUser(data.access_token);
		} catch (err) {
			console.log('Server unreachable');
		}
	};

	return (
		<div className="login-page">
			<div className="login-left">
				<div className="bg-image kenburns-bottom-right"></div>
				<h1 className="app-title text-focus-in">Libftea</h1>
				<p className="app-subtitle">
					Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
					eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis p
				</p>
			</div>
			<div className="login-right">
				{show2FA ? (
					<>
						<h1>Verification</h1>
						<p>A code has been sent to your email.</p>
						{/* 2FA form shown only if backend required it */}
						<form onSubmit={handle2FASubmit}>
							<div className="field">
								<label htmlFor="code" className="sr-only">
									Verification code
								</label>
								<input
									type="text"
									placeholder="Enter your 6-digit code"
									value={twoFactorCode}
									onChange={(e) => setTwoFactorCode(e.target.value)}
									maxLength={6}
									required
								/>
							</div>
							{errorMessage && (
								<div className="error-message shake-horizontal">{errorMessage}</div>
							)}
							<div className="form-button">
								<button type="submit">Verify</button>
								{/* Reset back to login form */}
								<button
									type="button"
									onClick={() => {
										setShow2FA(false);
										setErrorMessage(null);
									}}
								>
									Back
								</button>
							</div>
						</form>
					</>
				) : (
					<>
						<h1>Login</h1>
						{/* Standard login form */}
						<form onSubmit={handleSubmit}>
							<div className="field">
								<label htmlFor="username" className="sr-only">
									Username
								</label>
								<input
									type="text"
									name="username"
									placeholder="Username"
									value={username}
									onChange={handleUsernameChange}
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="password" className="sr-only">
									Password
								</label>
								<input
									type="password"
									name="password"
									placeholder="Password"
									value={password}
									onChange={handlePasswordChange}
									required
								/>
							</div>
							{errorMessage && (
								<div className="error-message shake-horizontal">{errorMessage}</div>
							)}
							<div className="form-button">
								<button type="submit">Login</button>
								{/* Navigate to registration page */}
								<p className="no-account">No account yet ?</p>
								<button type="button" onClick={() => navigate('/register')}>
									Create new account
								</button>
								{/* GitHub OAuth login */}
								<button type="button" onClick={() => window.location.href = 'http://localhost:3000/auth/github'}>
									Login with GitHub
								</button>
							</div>
						</form>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
