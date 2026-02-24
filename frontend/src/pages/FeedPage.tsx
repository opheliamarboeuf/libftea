import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./FeedPage.css"

//dur dur de faire la trad la

const HomePage = () => {

	const { user, setUser } = useUser();
	const navigate = useNavigate();
	const { t } = useTranslation();

	//demander si c'est pas mieux de mettre juste your feed
	return (
		<div className='feed-page'>
		<h1>
		{t('userprofile.feed')}
		</h1>
		</div>
	)
};

export default HomePage;

