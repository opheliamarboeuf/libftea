import { useState, ChangeEvent } from 'react'
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

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
		e.preventDefault();
		setErrorMessage(null);
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
	
			const data = await res.json();

			if (!res.ok){
				if (Array.isArray(data.message)){
					setErrorMessage(data.message[0]);} 
				else {
					setErrorMessage(data.message || "Registration Failed")
				}
				return ;
			}
	
			localStorage.setItem("token", data.access_token);

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
			console.log("Server unreachable");
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<div className="w-80 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
				<h1 className="text-4xl text-center mb-8 text-black" style={{ fontFamily: "'Blosta Script', cursive" }}>
					Register
				</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label htmlFor="username" className="sr-only">Username</label>
						<input
							type="text"
							name="username"
							placeholder="Username"
							value={username}
							onChange={handleUsernameChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
							style={{ fontFamily: "'Playfair Display', serif" }}
						/> 
					</div>
					<div>
						<label htmlFor="email" className="sr-only">Email</label>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={email}
							onChange={handleEmailChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
							style={{ fontFamily: "'Playfair Display', serif" }}
						/>
					</div>
					<div>
						<label htmlFor="password" className="sr-only">Password</label>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={password}
							onChange={handlePasswordChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
							style={{ fontFamily: "'Playfair Display', serif" }}
						/> 
					</div>
					{errorMessage && (
						<div className="text-gray-500 text-center text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
							{errorMessage}
						</div>
					)}
					<button 
						type="submit"
						className="w-full py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-600 transition-all outline-none"
						style={{ fontFamily: "'Playfair Display', serif" }}
					>
						Register
					</button>
					<p className="text-center text-gray-600 text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
						Already have an account?
					</p>
					<button 
						type="button"
						onClick={() => navigate("/login")}
						className="w-full py-2 border border-gray-300 rounded-lg hover:bg-neutral-200 transition-all outline-none"
						style={{ fontFamily: "'Playfair Display', serif" }}
					>
						Log in to account
					</button>
				</form>
			</div>
		</div>
	);
};

export default RegisterPage;

