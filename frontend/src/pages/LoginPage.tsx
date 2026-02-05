import "../App.css";
import React, { useState, ChangeEvent } from "react";
import { useUser } from "../context/UserContext";
import { Navigate, useNavigate } from "react-router-dom";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { setUser } = useUser();
	const navigate = useNavigate();

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
					setErrorMessage(data.message || "Registration Failed")
				}
				return ;
			}

			setUser({
				username: data.username,
				email: data.email,
			});

			localStorage.setItem("token", data.access_token);
			navigate("/home", {replace: true});
		}
		catch(err){
			console.log("Server unreachable");
		}
	}

	return (
		<div className="app-container">
			<div className="app-title text-focus-in">WebApp</div>
			<div className="form">
				<h1>Login</h1>
				<form onSubmit={handleSubmit}>
					<div className="field">
						<label htmlFor="username" className="sr-only">Username</label>
							<input 
								type="text" 
								name="username"
								placeholder="Username"
								value = {username}
								onChange={handleUsernameChange}
								required
							/>
					</div>
					<div className="field">
						<label htmlFor="password" className="sr-only">Password</label>
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
						<button type="submit">
							Login
						</button>
						<button onClick={() =>
							navigate("/register")}>
							Create new account
						</button>
					</div>
					
				</form>
			</div>
		</div>
	);
};

		
export default LoginPage;

