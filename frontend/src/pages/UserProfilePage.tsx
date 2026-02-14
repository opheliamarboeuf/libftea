import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { AddFriendButton } from "../friends";
import "./MyProfilePage.css"

const URL = 'http://localhost:3000/users';

interface UserProfile {
	id: number,
	username: string,
	avatarUrl?: string,
	coverUrl?: string,
	bio?: string,
}

const UserProfilePage = () => {
	const { id} = useParams<{ id: string }>();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const { user } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			const token = localStorage.getItem('token');
			const res = await fetch(`${URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.ok) {
				const data = await res.json();
				setProfile(data);
			}
		};

		fetchProfile();
	}, [id]);

	useEffect(() => {
		if (user && profile && user.id === profile.id) {
			navigate('/myprofile');
		}
	}, [user, profile, navigate]);
	
	if (!profile) {
		return <div style={{ padding: '20px' }}>Chargement...</div>;
	}

	return (
		<div style={{ padding:'20px' }}>
			<h1>{profile.username}'s Profile</h1>

			{profile.coverUrl && (
				<div className="cover">
					<img src={profile.coverUrl}  alt="Cover" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
				</div>
			)}

			{profile.avatarUrl && (
				<div className="avatar">
				<img src={profile.avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
				</div>
			)}

			{profile.bio && (
				<div className="bio">
					<p>{profile.bio}</p>
				</div>
			)}

			<AddFriendButton userId={profile.id} />

			<button onClick={() => navigate(-1)} style={{marginTop: '20px' }}>
				Retour
			</button>
		</div>
	);
};

export default UserProfilePage;
