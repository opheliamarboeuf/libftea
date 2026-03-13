import "../App.css";
import "./RegisterPage.css";
import { useState, ChangeEvent } from 'react'
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LanguageMenu from "../common/components/LanguageMenu";

const RegisterPage = () => {
	
	// Local state for form fields
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// Hold a backend error message (or null if no error)
	const [errorMessage, setErrorMessage] = useState<string | null>(null); // can be either a string or null, and it is initialized to null
	const navigate = useNavigate();

	// Access setUser from the global UserContext
	const { setUser } = useUser();

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
	
	// Handle form submission
	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) =>{
		e.preventDefault(); // prevent full page reload
		setErrorMessage(null); // clear previous errors
		const userData = {
			username: username,
			email: email, 
			password: password
		};
		try {
			const res = await fetch("http://localhost:3000/auth/register", {
				method: 'POST',
				headers: {'Content-Type': 'application/json',},
				body: JSON.stringify(userData),
			});
	
			// read JSON response
			const data = await res.json();

			if (!res.ok){	// based on a NestJS error structure
				if (Array.isArray(data.message)){ // if it's an Array, set the message of the first array in errorMessage
					setErrorMessage(data.message[0]);} 
				else {
					setErrorMessage(data.message || t('registerpage.regiterfail')) // if it is a string, set "Registration Failed" is the string is empty
				}
				return ;
			}
	
			// Save JWT token
			localStorage.setItem("token", data.access_token);

			// Fetch full user data and store in context
			const userRes = await fetch("http://localhost:3000/auth/me", {
				headers: {
					Authorization: `Bearer ${data.access_token}`,
				},
			});
			const fullUserData = await userRes.json();
			setUser(fullUserData);
			navigate("/feed", {replace: true}) ;
		}
		catch (err){
			console.log(t('registerpage.serverfail'));
		}
	};

	return (
		<div className="register-page">
			<div className="form">
			<LanguageMenu />
				<form onSubmit={handleSubmit}>
					<h1>{t('registerpage.register')}</h1>
					<div className = "field">
						<label htmlFor="username" className="sr-only">{t('loginpage.username')}</label>
							<input
								type = "text"
								name = "username"
								placeholder= {t('loginpage.username')}
								value = {username}
								onChange = {handleUsernameChange} // call handleUsernameChange
								required
							/> 
						</div>
					<div className = "field">
						<label htmlFor="email" className="sr-only">Email</label>
							<input
								type = "email"
								name = "email"
								placeholder="Email"
								value = {email}
								onChange = {handleEmailChange}
								required
							/>
					</div>
					<div className = "field">
						<label htmlFor="password" className="sr-only">{t('loginpage.password')}</label>
							<input
								type = "password"
								name = "password"
								placeholder={t('loginpage.password')}
								value = {password}
								onChange = {handlePasswordChange}
								required
							/> 
					</div>
					{errorMessage && (
						<div className="error-message shake-horizontal">{errorMessage}</div>
					)}
					<div className="form-button">
						<button type="submit">
							{t('registerpage.register')}
						</button>
						<p className="no-account">{t('registerpage.alreadyhave')}</p>
						<button onClick={() =>
							navigate("/login")}>
							{t('registerpage.loginto')}
						</button>
					</div>
				</form>
			
			</div>
		</div>
	);
};

export default RegisterPage;

