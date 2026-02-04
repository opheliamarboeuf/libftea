import React, { useState, ChangeEvent } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

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
			navigate("/profile", {replace: true});
		}
		catch(err){
			console.log("Server unreachable");
		}
	}

	return (
	<div className="form">
		<form onSubmit={handleSubmit}>
		<div className="field">
			<label>
				Username
				<input 
					type="text" 
					name="username"
					value = {username}
					onChange={handleUsernameChange}
					required
				/>
			</label>
		</div>
		<div className="field">
			<label>
				Password
				<input 
					type="password"
					name="password"
					value={password}
					onChange={handlePasswordChange}
					required
				/>
			</label>
		</div>
			{errorMessage && (
				<div className="error-message">
					{errorMessage}
				</div>
			)}
		<div className="form-button">
			<button type="submit">Login</button>
		</div>
		</form>
	</div>
	);
};

export default LoginPage;
