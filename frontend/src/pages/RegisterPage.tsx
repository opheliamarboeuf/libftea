import { useState, ChangeEvent } from 'react'
import { useUser } from '../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';

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
					setErrorMessage(data.message || "Registration Failed") // if it is a string, set "Registration Failed" is the string is empty
				}
				return ;
			}
	
			// Store the user in the global context
			setUser({
				username: data.username,
				email: data.email,
			});

			// Save JWT token and redirect to profile
			localStorage.setItem("token", data.access_token);
			navigate("/profile", {replace: true}) ;
		}
		catch (err){
			console.log("Server unreachable");
		}
	};

	return (
		<div className = "form">
		<form onSubmit={handleSubmit}>
			<div className = "field">
				<label>
					Username 
					<input
						type = "text"
						name = "username"
						value = {username}
						onChange = {handleUsernameChange} // call handleUsernameChange
						required
					/> 
				</label>
			</div>
			<div className = "field">
				<label>
					Email 
					<input
						type = "email"
						name = "email"
						value = {email}
						onChange = {handleEmailChange}
						required
					/>
				</label>
			</div>
			<div className = "field">
				<label>
					Password 
					<input
						type = "password"
						name = "password"
						value = {password}
						onChange = {handlePasswordChange}
						required
					/> 
				</label>
			</div>
				{errorMessage && ( //Displays backend error message if any
					<div className="error-message">
					{errorMessage}
					</div>
					)}
			<div className = "form-button">
				<button type = "submit">Register</button>
			</div>
		</form>
		</div>
	);
};

export default RegisterPage;
