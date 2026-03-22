import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const GithubCallbackPage = () => {
	const navigate = useNavigate();
	const { refreshUser } = useUser();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (token) {
			localStorage.setItem('token', token);
			refreshUser().then(() => {
				navigate('/feed', { replace: true });
			});
		} else {
			navigate('/login', { replace: true });
		}
	}, []);

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
			<p>Connecting with GitHub...</p>
		</div>
	);
};

export default GithubCallbackPage;