import "../App.css";
import "./LoginPage.css";
import { useState, ChangeEvent } from "react";
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
						<p className="no-account">No account yet ?</p>
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

