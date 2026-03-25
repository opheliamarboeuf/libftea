import { useState, useEffect, ChangeEvent } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageMenu from "../common/components/LanguageMenu";
import { TermsButton } from "../common/components/TermsOfService";
import { PrivacyButton } from "../common/components/PrivacyPolicy";

const API_URL = import.meta.env.VITE_API_URL;

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
	// Form state
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	// Error + 2FA state handling
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [show2FA, setShow2FA] = useState(false);
	const [twoFactorCode, setTwoFactorCode] = useState('');
	const [pendingUserId, setPendingUserId] = useState<number | null>(null);
	const [visible, setVisible] = useState(false);
	const { setUser } = useUser();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const isJp = i18n.language === 'jp';

	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 20);
		return () => clearTimeout(t);
	}, []);

	const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

	const errorMessages = (message: string): string => {
		if (message.includes("not found")) return 'errors.notfound';
		if (message.includes("Incorrect")) return 'errors.pswincorrect';
		return 'errors.lfailed';
	}
	// Fetch full user profile after receiving JWT token
	const fetchAndSetUser = async (token: string) => {
		const res = await fetch(`${API_URL}/auth/me`, {
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
			const res = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (!res.ok){	// based on a NestJS error structure
				if (Array.isArray(data.message)){ // if it's an Array, set the message of the first array in errorMessage
					setErrorMessage(t(errorMessages(data.message[0])));} 
				else {
					setErrorMessage(t(errorMessages(data.message || ""))) // if it is a string, set "Registration Failed" is the string is empty
				}
				return ;
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
			const res = await fetch(`${API_URL}/auth/2fa/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: pendingUserId, code: twoFactorCode }),
			});

			const data = await res.json();

			if (!res.ok) {
				setErrorMessage(
					Array.isArray(data.message) ? data.message[0] : data.message || t('errors.code'),
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
		<div
			className="fixed inset-0 flex items-center justify-center"
			style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease' }}
		>
			<LanguageMenu fixed/>
			<div className="w-80 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
				<h1 className="text-4xl text-center mb-8 text-black" style={{ fontFamily: isJp ? "'Noto Serif JP', serif" : "'Blosta Script', cursive" }}>
					{show2FA ? t('loginpage.verif') : t('loginpage.login')}
				</h1>

				{show2FA ? (
					// 2FA Form
					<form onSubmit={handle2FASubmit} className="flex flex-col gap-4">
						<p className="text-center text-gray-600 text-sm mb-2">
							{t('loginpage.sentemail')}
						</p>
						<div>
							<label htmlFor="code" className="sr-only">{t('loginpage.verifcode')}</label>
							<input 
								type="text" 
								name="code"
								placeholder={t('loginpage.enter')}
								value={twoFactorCode}
								onChange={(e) => setTwoFactorCode(e.target.value)}
								maxLength={6}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500 text-sm placeholder:text-sm"
							/>
						</div>
						{errorMessage && (
							<div className="text-red-500 text-center text-sm">
								{errorMessage}
							</div>
						)}
						<button 
							type="submit"
							className="w-full py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-600 transition-all outline-none"
						>
							{t('loginpage.verify')}
						</button>
						<button 
							type="button"
							onClick={() => {
								setShow2FA(false);
								setErrorMessage(null);
								setTwoFactorCode('');
							}}
							className="w-full py-2 border border-gray-300 rounded-lg hover:bg-neutral-200 transition-all outline-none"
						>
							{t('loginpage.back')}
						</button>
					</form>
				) : (
					// Login Form
					<>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div>
							<label htmlFor="username" className="sr-only">{t('loginpage.username')}</label>
							<input 
								type="text" 
								name="username"
								placeholder={t('loginpage.username')}
								value={username}
								onChange={handleUsernameChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">{t('loginpage.password')}</label>
							<input 
								type="password"
								name="password"
								placeholder={t('loginpage.password')}
								value={password}
								onChange={handlePasswordChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
							/>
						</div>
						{errorMessage && (
							<div className="text-red-500 text-center text-sm">
								{errorMessage}
							</div>
						)}
						<button 
							type="submit"
							className="w-full py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-600 transition-all outline-none"
						>
							{t('loginpage.login')}
						</button>
						<button 
							type="button"
							onClick={() => window.location.href = `${API_URL}/auth/github`}
							className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all outline-none"
						>
							{t('loginpage.github')}
						</button>
						<p className="text-center text-gray-600 text-sm">
							{t('loginpage.noaccount')}
						</p>
						<button 
							type="button"
							onClick={() => navigate("/register")}
							className="w-full py-2 border border-gray-300 rounded-lg hover:bg-neutral-200 transition-all outline-none"
						>
							{t('loginpage.create')}
						</button>
					</form>
					<div className="flex justify-center gap-4 mt-6">
						<PrivacyButton className="text-sm text-gray-500 hover:text-gray-800 transition-colors"/>
						<TermsButton className="text-sm text-gray-500 hover:text-gray-800 transition-colors"/>
					</div>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
