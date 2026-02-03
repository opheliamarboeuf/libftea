import { useState, ChangeEvent, FormEvent } from 'react'

const RegisterPage = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null); // can be either a string or null, and it is initialized to null

	// Create 3 changeEvent for each input field
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
	
	// Create a FormEvent
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>{
		e.preventDefault(); // prevents the page to refresh after submitting
		setErrorMessage(null); // reset error
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
			// extract token
			const token = data.access_token; //TOKEN A SUPPRIMER
			localStorage.setItem("token", token);
			window.location.href = "/profile"; 
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
				  {errorMessage && (
					 <div className="error-message">
					  {errorMessage}
 					</div>
  )}
			</div>
			<div className = "form-button">
			<button type = "submit">Register</button>
			</div>
		</form>
		</div>
	);
};

export default RegisterPage;

// // Gestionnnaire d'event

// // Pour ChangeEvent<HTMLInputElement>
// {
//   target: {
//     value: string;       // La valeur actuelle
//     name: string;        // L'attribut name (si présent)
//     type: string;        // "text", "email", etc.
//     checked?: boolean;   // Pour checkboxes
//     // ... autres propriétés HTMLInputElement
//   },
//   currentTarget: HTMLInputElement,
//   preventDefault: () => void,
//   // ... autres méthodes
// }

// // Pour FormEvent<HTMLFormElement>
// {
//   target: HTMLFormElement,
//   currentTarget: HTMLFormElement,
//   preventDefault: () => void,  // Empêche rechargement page
//   // ... autres méthodes
// }

// Exemple d’erreur NestJS :
// {
//   "statusCode": 400,
//   "message": [
//     "username must be at least 3 characters",
//     "password is not strong enough"
//   ],
//   "error": "Bad Request"
// }
