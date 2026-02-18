import { useUser, Post } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import "./FeedPage.css"

const FeedPage = () => {

	const { user, setUser } = useUser();
	const [usersPosts, setUsersPosts] = useState<Post[]>([]); 

	if (!user) return <Navigate to="/" replace />;

	const API_URL = "http://localhost:3000";

	const fetchUsersPosts = async () => {
	const res = await fetch(`${API_URL}/users/posts`, {
		headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});

	const data = await res.json();
	if (!res.ok)
		console.log("fetch users posts failed:", data);
	else
		setUsersPosts(data);	
}

useEffect(() => { fetchUsersPosts(); }, []);

	return (
	<div className='feed-page'>
		<h1>
		{user.profile.displayName
			? `${user.profile.displayName}'s Feed Page`
			: `${user.username}'s Feed Page`}
		</h1>

		<div className='posts-list'>
		{usersPosts.map((post) => (
			<div key={post.id} className='post'>
			<h3>{post.title}</h3>
			{post.caption && <p>{post.caption}</p>}
			<p style={{ fontSize: '0.8em', color: '#666' }}>
				Créé le {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'date inconnue'}
			</p>
			</div>
		))}
		</div>
	</div>
	);

};

export default FeedPage;


// RECUP LES POST DE 1 UTILISATEUR
// const FeedPage = () => {

// 	const { user, setUser } = useUser();
// 	if (!user) return <Navigate to="/" replace />;



// 	const API_URL = "http://localhost:3000";

// 	// Création d'un post
// 	const createPost = async () => {
// 		const profile = {
// 			title: "Ceci est un titreeeeeee",
// 			caption: "Ceci est une caption",
// 		};

// 		const res = await fetch(`${API_URL}/posts/create`, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 				Authorization: `Bearer ${localStorage.getItem("token")}`,
// 			},
// 			body: JSON.stringify(profile),
// 		});

// 		const data = await res.json();
// 		if (!res.ok) console.log("post creation failed:", data);
// 		return data;
// 	};

// 	// Récupération des posts
// 	const fetchPosts = async () => {
// 		const res = await fetch(`${API_URL}/auth/me`, {
// 			headers: {
// 				"Content-Type": "application/json",
// 				Authorization: `Bearer ${localStorage.getItem("token")}`,
// 			},
// 		});

// 		const data = await res.json();
// 		if (!res.ok)
// 			console.log("fetch posts failed:", data);
// 		else
// 			setUser(data);
// 	};

// 	// Bouton pour créer un post puis actualiser la liste
// 	const handleCreatePost = async () => {
// 		await createPost();
// 		await fetchPosts();
// 	};

// 	// Charger les posts au montage du composant
// 	useEffect(() => {
// 		fetchPosts();
// 	}, []);

// 	return (
// 		<div className='feed-page'>
// 			<h1>
// 				{user.profile.displayName
// 					? `${user.profile.displayName}'s Feed Page`
// 					: `${user.username}'s Feed Page`}
// 			</h1>

// 			<button onClick={handleCreatePost}>Créer un post</button>

// 			<div className='posts-list'>
// 				{user.posts.map((post) => (
// 				<div key={post.id} className='post'>
// 					<h3>{post.title}</h3>
// 					{post.caption && <p>{post.caption}</p>}
// 					<p style={{ fontSize: "0.8em", color: "#666" }}>
// 					Créé le {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'date inconnue'}
// 					</p>
// 				</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// };

// export default FeedPage;
