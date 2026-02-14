import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import "./FeedPage.css"

const HomePage = () => {

	const { user, setUser } = useUser();
	const navigate = useNavigate();

	return (
		<div className='feed-page'>
		<h1>
		{user.profile.displayName
			? `${user.profile.displayName}'s Feed Page`
			: `${user.username}'s Feed Page`}
		</h1>
		</div>
	)
};

export default HomePage;

