import "./FeedPage.css"
import { useUser, Post } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postsApi } from "../posts/api";
import { UserPostsList } from "../posts/components/userPostsList";

const FeedPage = () => {

	const { user } = useUser();
	const [usersPosts, setUsersPosts] = useState<Post[]>([]); 

	if (!user) return <Navigate to="/" replace />;

	const loadPosts = async () => {
		try {
			const data = await postsApi.fetchAllUserPosts();
			setUsersPosts(data);
		} catch (error) {
			console.error(error);
		}
	} 

	useEffect(() => { loadPosts(); }, []);

	return (
	<div className='feed-page'>
		<h1>
		{user.profile.displayName
			? `${user.profile.displayName}'s Feed Page`
			: `${user.username}'s Feed Page`}
		</h1>

		<div className='posts-list'>
			<UserPostsList posts={usersPosts} onPostDeleted={loadPosts} />
		</div>
	</div>
	);
};

export default FeedPage;

