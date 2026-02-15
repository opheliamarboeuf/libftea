import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { friendsApi } from "../friends/api";
import "./MyProfilePage.css"

const URL = 'http://localhost:3000/users';

type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED';

interface UserProfile {
	id: number,
	username: string,
	avatarUrl?: string,
	coverUrl?: string,
	bio?: string,
	friendshipStatus: FriendshipStatus,
}

const UserProfilePage = () => {
	const { id} = useParams<{ id: string }>();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const { user, refreshUser } = useUser();
	const navigate = useNavigate();

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

	useEffect(() => {
		fetchProfile();
	}, [id]);

	useEffect(() => {
		if (user && profile && user.id === profile.id) {
			navigate('/myprofile');
		}
	}, [user, profile, navigate]);

	const handleAddFriend = async () => {
		if (!profile) return;
		setLoading(true);
		try {
			await friendsApi.sendFriendRequest(profile.id);
			await refreshUser();
			await fetchProfile();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de l\'envoi de la demande');
		} finally {
			setLoading(false);
		}
	};

	const handleCancelRequest = async () => {
		if (!profile) return;
		setLoading(true);
		try {
			await friendsApi.cancelRequest(profile.id);
			await refreshUser();
			await fetchProfile();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de l\'annulation');
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async () => {
		if (!profile) return;
		setLoading(true);
		try {
			await friendsApi.acceptFriendRequest(profile.id);
			await refreshUser();
			await fetchProfile();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de l\'acceptation');
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async () => {
		if (!profile) return;
		setLoading(true);
		try {
			await friendsApi.rejectFriendRequest(profile.id);
			await refreshUser();
			await fetchProfile();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors du refus');
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveFriend = async () => {
		if (!profile) return;
		setLoading(true);
		try {
			await friendsApi.removeFriend(profile.id);
			await refreshUser();
			await fetchProfile();
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de la suppression');
		} finally {
			setLoading(false);
		}
	};

	const renderFriendshipButton = () => {
		if (!profile) return null;

		switch (profile.friendshipStatus) {
			case 'NONE':
				return (
					<button onClick={handleAddFriend} disabled={loading}>
						Ajouter en ami
					</button>
				);
			case 'PENDING_SENT':
				return (
					<button onClick={handleCancelRequest} disabled={loading} style={{ backgroundColor: '#888' }}>
						Annuler la demande
					</button>
				);
			case 'PENDING_RECEIVED':
				return (
					<div style={{ display: 'flex', gap: '10px' }}>
						<button onClick={handleAccept} disabled={loading} style={{ backgroundColor: '#4CAF50' }}>
							Accepter
						</button>
						<button onClick={handleReject} disabled={loading} style={{ backgroundColor: '#f44336' }}>
							Refuser
						</button>
					</div>
				);
			case 'ACCEPTED':
				return (
					<button onClick={handleRemoveFriend} disabled={loading} style={{ backgroundColor: '#f44336' }}>
						Retirer des amis
					</button>
				);
			case 'BLOCKED':
				return <span style={{ color: '#888' }}>Utilisateur bloqué</span>;
			default:
				return null;
		}
	};
	
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

			{renderFriendshipButton()}

			<button onClick={() => navigate(-1)} style={{marginTop: '20px' }}>
				Retour
			</button>
		</div>
	);
};

export default UserProfilePage;
