import "../App.css";
import "./MyProfilePage.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { Post } from "../context/UserContext";
import { postsApi } from "../posts/api";
import { UserPostsList } from "../posts/components/UserPostsList";
import { ConfirmBlockDelete } from "../friends/ConfirmBlockDelete";
import { BlockFriendButton } from "../friends/BlockFriendButton";
import { useFriendsSocket } from "../friends/useFriendsSocket";
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
	const { user, refreshUser } = useUser();
	const { showModal } = useModal();
	const { id} = useParams<{ id: string }>();
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const navigate = useNavigate();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [blockedByUser, setBlockedByUser] = useState(false);
	const [blockedPosts, setBlockedPosts] = useState(false);
	const [isOnline, setIsOnline] = useState(false);
	const { showModal } = useModal();
	const { t } = useTranslation();

	const fetchProfile = async () => {
		const token = localStorage.getItem('token');
		try {
			const res = await fetch(`${API_URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
	
			// if blocked by the current user
			if (res.status === 403)
			{
				setBlockedByUser(true);
				return ;
			}

			setBlockedByUser(false);

			if (!res.ok) {
				throw new Error("Error fetching profile");
			}

			const data = await res.json();
			setUserData(data);
			// if the current user has blocked the user's profile
			if (data.friendshipStatus === 'BLOCKED') {
				setBlockedPosts(true);
			}
			else {
				setBlockedPosts(false)};
				await loadPosts();
			}    
		catch (error) {
			console.error(error);
			showModal?.("Could not fetch profile");
		}
	}

	const loadPosts = async () => {
		if (!id)
			return ;
		const data = await postsApi.fetchUserPosts(Number(id));
		setPosts(data);
	}

	useEffect(() => {
		fetchProfile();
		loadPosts();
	}, [id]);

	useEffect(() => {
		if (user && userData && user.id === userData.id) {
			navigate('/myprofile');
		}
	}, [user, userData, navigate]);


	const { emit } = useFriendsSocket(user?.id, {
		onRequestSent: () => {
			setLoading(false);
			refreshUser();
			fetchProfile();
		},
		onRequestUnsent: () => {
			setLoading(false);
			refreshUser();
			fetchProfile();
		},
		onRequestReceived: () => {
			refreshUser();
			fetchProfile();
		},
		onRequestAccepted: () => {
			setLoading(false);
			refreshUser();
			fetchProfile();
		},
		onRequestRejected: () => {
			setLoading(false);
			refreshUser();
			fetchProfile();
		},
		onFriendRemoved: () => {
			setLoading(false);
			refreshUser();
			fetchProfile();
			showModal("Friend removed");
		},
		onUserRemoved: () => {
			refreshUser();
			fetchProfile();
		},
		onYouWereBlocked: () => {
			refreshUser();
			fetchProfile();
		},
		onYouWereUnblocked: () => {
			refreshUser();
			fetchProfile();
		},
		onUserOnline: (data) => {
			if (data.userId === Number(id)) setIsOnline(true);
		},
		onUserOffline: (data) => {
			if (data.userId === Number(id)) setIsOnline(false);
		},
		onOnlineStatus: (data) => {
			if (data.userId === Number(id)) setIsOnline(data.isOnline);
		},
	});

	useEffect(() => {
		if (id) {
			emit('get_online_status', { userId: Number(id) });
		}
	}, [id]);

	const handleAddFriend = async () => {
		if (!userData) return;
		setLoading(true);
		emit("send_friend_request", { requesterId: user?.id, addresseId: Number(id) });
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
		emit("unsend_friend_request", { requesterId: user?.id, addresseId: Number(id) });
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
		emit("accept_friend_request", { requesterId: Number(id), addresseId: user?.id });
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
		emit("reject_friend_request", { requesterId: Number(id), addresseId: user?.id });
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
		emit("remove_friend", { userId: user?.id, friendId: userData.id });
		setShowDeleteConfirm(false);
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
					<button className="profile-action-btn" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
						Delete friend
					<button className="profile-action-btn" onClick={handleRemoveFriend} disabled={loading}>
						{t('friends.remove')}
					</button>
					{showDeleteConfirm && (
									<ConfirmBlockDelete
										message="Are you sure you want to delete this friend from your friendlist?"
										onYes={handleRemoveFriend}
										onNo={() => setShowDeleteConfirm(false)}
									/>
					)}
					</div>
				);
			case 'BLOCKED':
				return <span> </span>;
				return <span>{t('friends.blocked')}</span>;
			default:
				return null;
		}
	};
	
	if (blockedByUser) {
		return <div className="profile-page is-blocked">You cannot access this profile</div>;
	}
	if (!userData) {
		return <div className="profile-page">Loading...</div>;
		return <div>{t('userprofile.loading')}</div>;
	}

	return (
		<div className="profile-page">
			{/* MAIN CONTENT */}
			<div className="main-content">
				{/* PROFILE INFO COLUMN */}
				<div className="profile-info">
					<div className="online-status">
						{isOnline ? <span>☀️</span> : <span className="moon">🌙</span>}
						<span>{isOnline ? 'Online' : 'Offline'}</span>
					</div>
					<p className="display-name">
						{userData.profile?.displayName ? userData.profile.displayName : '\u00A0'} {/*space to keep the height*/}
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
						<span>Friends: {userData.friendsCount}</span>
						<span>Posts: {posts.length}</span>
						<span>{t('userprofile.friends')}{userData.friendsCount}</span>
						<span>{t('userprofile.posts')}</span>
					</div>
					<div className="block-user">
						<BlockFriendButton userId={userData.id} onAction={fetchProfile} />
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
						{blockedPosts ? <div className="blocked-line">You have blocked this user</div> : <UserPostsList posts={posts} />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfilePage;
