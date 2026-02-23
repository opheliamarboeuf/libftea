import "../App.css";
import "./MyProfilePage.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { friendsApi } from "../friends/api";
import { useModal } from "../context/ModalContext";
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:3000/users';
const BASE_URL = 'http://localhost:3000';

type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED';

interface UserProfile {
	id: number,
	username: string,
	profile: {
		avatarUrl?: string,
		coverUrl?: string,
		bio?: string,
		displayName?: string,
	} | null,
	friendsCount: number,
	friendshipStatus: FriendshipStatus,
}

const UserProfilePage = () => {
	const { id} = useParams<{ id: string }>();
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const { user, refreshUser } = useUser();
	const navigate = useNavigate();
	const { showModal } = useModal();
	const { t } = useTranslation();

	const fetchProfile = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(`${API_URL}/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.ok) {
			const data = await res.json();
			setUserData(data);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, [id]);

	useEffect(() => {
		if (user && userData && user.id === userData.id) {
			navigate('/myprofile');
		}
	}, [user, userData, navigate]);

	const handleAddFriend = async () => {
		if (!userData) return;
		setLoading(true);
		try {
			await friendsApi.sendFriendRequest(userData.id);
			await refreshUser();
			await fetchProfile();
			showModal(t('friends.sent'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.sentfail'));
		} finally {
			setLoading(false);
		}
	};

	const handleCancelRequest = async () => {
		if (!userData) return;
		setLoading(true);
		try {
			await friendsApi.cancelRequest(userData.id);
			await refreshUser();
			await fetchProfile();
			showModal(t('friends.canceled'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.errorcancel')); 
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async () => {
		if (!userData) return;
		setLoading(true);
		try {
			await friendsApi.acceptFriendRequest(userData.id);
			await refreshUser();
			await fetchProfile();
			showModal(t('friends.accepted'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.requestfail'));
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async () => {
		if (!userData) return;
		setLoading(true);
		try {
			await friendsApi.rejectFriendRequest(userData.id);
			await refreshUser();
			await fetchProfile();
			showModal(t('friends.rejected'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.requestfail'));
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveFriend = async () => {
		if (!userData) return;
		setLoading(true);
		try {
			await friendsApi.removeFriend(userData.id);
			await refreshUser();
			await fetchProfile();
			showModal(t('friends.removed'));
		} catch (error) {
			console.error('Error:', error);
			showModal(t('friends.requestfail'))
		} finally {
			setLoading(false);
		}
	};

	const renderFriendshipButton = () => {
		if (!userData) return null;

		switch (userData.friendshipStatus) {
			case 'NONE':
				return (
					<button className="profile-action-btn" onClick={handleAddFriend} disabled={loading}>
						{t('friends.addfriend')}
					</button>
				);
			case 'PENDING_SENT':
				return (
					<button className="profile-action-btn" onClick={handleCancelRequest} disabled={loading}>
						{t('friends.cancelrequest')}
					</button>
				);
			case 'PENDING_RECEIVED':
				return (
					<div className="btn-group">
						<button className="profile-action-btn" onClick={handleAccept} disabled={loading}>
							{t('friends.acceptrequest')}
						</button>
						<button className="profile-action-btn" onClick={handleReject} disabled={loading}>
							{t('friends.rejectrequest')}
						</button>
					</div>
				);
			case 'ACCEPTED':
				return (
					<div className="btn-group">
					<button className="profile-action-btn" onClick={() => navigate("/chat")} disabled={loading}>
						{t('userprofile.sendmessage')}
					</button>
					<button className="profile-action-btn" onClick={handleRemoveFriend} disabled={loading}>
						{t('friends.remove')}
					</button>
					</div>
				);
			case 'BLOCKED':
				return <span>{t('friends.blocked')}</span>;
			default:
				return null;
		}
	};
	
	if (!userData) {
		return <div>{t('userprofile.loading')}</div>;
	}

	return (
		<div className="profile-page">
			{/* MAIN CONTENT */}
			<div className="main-content">
				{/* PROFILE INFO COLUMN */}
				<div className="profile-info">
					<p className="display-name">
						{userData.profile?.displayName ? user.profile.displayName : '\u00A0'} {/*space to keep the height*/}
					</p>
					<div className="profile-pic">
						<img
							src={
								userData.profile?.avatarUrl
									? `${BASE_URL}${userData.profile.avatarUrl}`
									: "/assets/images/default-avatar.jpeg"
							}
							alt="Profile Avatar"
						/>
					</div>
					<p className="display-username">{userData.username}</p>
					<div className="stats">
						<span>{t('userprofile.friends')}{userData.friendsCount}</span>
						<span>{t('userprofile.posts')}</span>
					</div>
					<div className="block-user">
						<button className="regular-btn" >{t('friends.block')}</button> 
					</div>
					<div className="bio">
						<p>{userData.profile?.bio || t('userprofile.writebio') }</p>
					</div>
				</div>

				{/* COVER, USER INTERACTIONS AND POSTS*/}
				<div className="cover-and-posts">
					<div className="cover">
						<img
							src={
								userData.profile?.coverUrl
									? `${BASE_URL}${userData.profile.coverUrl}`
									: "/assets/images/default-cover.jpeg"
							}
							alt="Cover"
						/>
							<div className="profile-actions">
								{renderFriendshipButton()}
							</div>
					</div>
					<div className="posts">
						<p>Post 1</p>
						<p>Post 2</p>
						<p>Post 3</p>
					</div>
				</div>
			</div>
		</div>
	);
};
	// return (
	// 	<div style={{ padding:'20px' }}>
	// 		<h1>{profile.username}'s Profile</h1>

	// 		{profile.coverUrl && (
	// 			<div className="cover">
	// 				<img src={profile.coverUrl}  alt="Cover" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
	// 			</div>
	// 		)}

	// 		{profile.avatarUrl && (
	// 			<div className="avatar">
	// 			<img src={profile.avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
	// 			</div>
	// 		)}

	// 		{profile.bio && (
	// 			<div className="bio">
	// 				<p>{profile.bio}</p>
	// 			</div>
	// 		)}

	// 		{renderFriendshipButton()}

	// 		<button onClick={() => navigate(-1)} style={{marginTop: '20px' }}>
	// 			Retour
	// 		</button>
	// 	</div>
	// );

export default UserProfilePage;
