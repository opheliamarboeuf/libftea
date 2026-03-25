import { useState, ChangeEvent } from 'react'
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LanguageMenu from "../common/components/LanguageMenu";
import { PrivacyButton } from "../common/components/PrivacyPolicy";
import { TermsButton } from "../common/components/TermsOfService";

const API_URL = import.meta.env.VITE_API_URL;

const RegisterPage = () => {
	
	// Local state for form fields
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// Hold a backend error message (or null if no error)
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const navigate = useNavigate();

	// Access setUser from the global UserContext
	const { setUser } = useUser();

	//To use translation
	const { t } = useTranslation();

	// Update username when input changes
	// e = ChangeEvent<HTMLInputElement> object
	// target = HTML element that triggered the event
	// value = input
	const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) =>{
		setUsername(e.target.value);
	}
	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>{
		setEmail(e.target.value);
	}
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>{
		setPassword(e.target.value);
	}

	const errorMessages = (message: string): string => {
		if (message.includes("email")) return 'errors.email';
		if (message.includes("password")) return 'errors.pswnotstrong';
		if (message.includes("already exists")) return 'errors.exists';
		return 'errors.failed';
	}
	
	// Handle form submission
	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) =>{
		e.preventDefault();
		setErrorMessage(null);
		const userData = {
			username: username,
			email: email, 
			password: password
		};
		try {
			const res = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json',},
				body: JSON.stringify(userData),
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
	
			localStorage.setItem("token", data.access_token);

			// Fetch full user data and store in context
			const userRes = await fetch(`${API_URL}/auth/me`, {
				headers: {
					Authorization: `Bearer ${data.access_token}`,
				},
			});
			const fullUserData = await userRes.json();
			setUser(fullUserData);
			navigate("/feed", {replace: true}) ;
		}
		catch (err){
			console.log("Server unreachable");
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<LanguageMenu fixed/>
			<div className="w-80 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
				<h1 className="text-4xl text-center mb-8 text-black" style={{ fontFamily: "'Blosta Script', cursive" }}>
					Register
				</h1>
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
						<label htmlFor="email" className="sr-only">{t('registerpage.email')}</label>
						<input
							type="email"
							name="email"
							placeholder={t('registerpage.email')}
							value={email}
							onChange={handleEmailChange}
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
						<div className="text-gray-500 text-center text-sm">
							{errorMessage}
						</div>
					)}
					<button 
						type="submit"
						className="w-full py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-600 transition-all outline-none"
					>
						{t('registerpage.register')}
					</button>
					<p className="text-center text-gray-600 text-sm">
						{t('registerpage.alreadyhave')}
					</p>
					<button 
						type="button"
						onClick={() => navigate("/login")}
						className="w-full py-2 border border-gray-300 rounded-lg hover:bg-neutral-200 transition-all outline-none"
					>
						{t('registerpage.loginto')}
					</button>
				</form>
				<div className="flex justify-center gap-4 mt-6">
					<PrivacyButton className="text-sm text-gray-500 hover:text-gray-800 transition-colors"/>
					<TermsButton className="text-sm text-gray-500 hover:text-gray-800 transition-colors"/>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;

