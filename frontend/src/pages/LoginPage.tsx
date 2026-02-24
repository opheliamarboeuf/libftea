import "../App.css";
import "./LoginPage.css";
import { useState, ChangeEvent } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageMenu from "../components/LanguageMenu";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { setUser } = useUser();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) =>{
		setUsername(e.target.value);
	}
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>{
		setPassword(e.target.value);
	}


	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) =>{
		e.preventDefault();
		setErrorMessage(null);

		const userData = {
			username : username,
			password : password
		};
		try {
			const res = await fetch("http://localhost:3000/auth/login", {
				method: 'POST',
				headers: {'Content-Type': 'application/json',},
				body: JSON.stringify(userData),
			});

			const data = await res.json();

			if (!res.ok){
				if (Array.isArray(data.message)){
					setErrorMessage(data.message[0]);} 
				else {
					setErrorMessage(data.message || "Login Failed")
				}
				return ;
			}

			localStorage.setItem("token", data.access_token);

			// Fetch full user data
			const userRes = await fetch("http://localhost:3000/auth/me", {
				headers: {
					Authorization: `Bearer ${data.access_token}`,
				},
			});
			const fullUserData = await userRes.json();
			setUser(fullUserData);
			navigate("/feed", {replace: true});
		}
		catch(err){
			console.log("Server unreachable");
		}
	}

	return (
		<div className="login-page">
			<div className="login-left">
				<div className="bg-image kenburns-bottom-right"></div>
				<h1 className="app-title text-focus-in ">Libftea</h1>
				<p className="app-subtitle">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis p</p>
			</div>
			<div className="login-right">
				<LanguageMenu />
				<h1>{t('loginpage.login')}</h1>
				<form onSubmit={handleSubmit}>
					<div className="field">
						<label htmlFor="username" className="sr-only">{t('loginpage.username')}</label>
							<input 
								type="text" 
								name="username"
								placeholder={t('loginpage.username')}
								value = {username}
								onChange={handleUsernameChange}
								required
							/>
					</div>
					<div className="field">
						<label htmlFor="password" className="sr-only">{t('loginpage.password')}</label>
							<input 
								type="password"
								name="password"
								placeholder={t('loginpage.password')}
								value={password}
								onChange={handlePasswordChange}
								required
							/>
					</div>
					{errorMessage && (
						<div className="error-message shake-horizontal">{errorMessage}</div>
					)}
					<div className="form-button">
						<button type="submit">
							{t('loginpage.login')}
						</button>
						<p className="no-account">{t('loginpage.noaccount')}</p>
						<button onClick={() =>
							navigate("/register")}>
							{t('loginpage.create')}
						</button>
					</div>
				</form>
		</div>
		</div>
	);
};

		
export default LoginPage;

