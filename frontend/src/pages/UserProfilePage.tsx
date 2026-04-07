import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useModal } from '../context/ModalContext';
import { Post } from '../context/UserContext';
import { UserPostsList } from '../posts/components/UserPostsList';
import { ConfirmBlockDelete } from '../friends/ConfirmBlockDelete';
import { UserProfileMenu } from '../profile/components/UserProfileMenu';
import { useFriendsSocket } from '../friends/useFriendsSocket';
import { UserNameWithRole } from '../common/components/UserNameWithRole';
import { useTranslation } from 'react-i18next';
import { mockDatabase } from '../mockData';
import { fetchUserPosts, fetchUserTournamentPosts } from '../mockData/mockUser';

const BASE_URL = import.meta.env.VITE_API_URL;

type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED';

interface UserProfile {
	id: number;
	username: string;
	role?: 'ADMIN' | 'MOD' | 'USER' | string;
	profile: {
		avatarUrl?: string;
		coverUrl?: string;
		bio?: string;
	} | null;
	friendsCount: number;
	friendshipStatus: FriendshipStatus;
}

const UserProfilePage = () => {
	const { user, refreshUser } = useUser();
	const { showModal } = useModal();
	const { id } = useParams<{ id: string }>();
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const navigate = useNavigate();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [blockedByUser, setBlockedByUser] = useState(false);
	const [blockedPosts, setBlockedPosts] = useState(false);
	const [isOnline, setIsOnline] = useState(false);
	const [profileTab, setProfileTab] = useState('posts');
	const [tournamentPosts, setTournamentPosts] = useState<Post[]>([]);
	const { t } = useTranslation();

	const fetchProfile = async () => {
		if (!id) return;
		const targetId = Number(id);
		const baseUser = mockDatabase.users.find((u) => u.id === targetId);
		if (!baseUser) return;

		// Check if current user has blocked them
		const blockedByMe = mockDatabase.friendships.some(
			(f) =>
				f.requesterId === user?.id && f.addresseId === targetId && f.status === 'BLOCKED',
		);
		if (blockedByMe) {
			setBlockedByUser(true);
			return;
		}
		setBlockedByUser(false);

		// Derive friendship status from current user's perspective
		const friendship = mockDatabase.friendships.find(
			(f) =>
				(f.requesterId === user?.id && f.addresseId === targetId) ||
				(f.requesterId === targetId && f.addresseId === user?.id),
		);

		let friendshipStatus: FriendshipStatus = 'NONE';
		if (friendship) {
			if (friendship.status === 'ACCEPTED') {
				friendshipStatus = 'ACCEPTED';
			} else if (friendship.status === 'BLOCKED') {
				friendshipStatus = 'BLOCKED';
			} else if (friendship.status === 'PENDING') {
				if (friendship.requesterId === user?.id) {
					friendshipStatus = 'PENDING_SENT';
				} else {
					friendshipStatus = 'PENDING_RECEIVED';
				}
			}
		}

		const friendsCount = mockDatabase.friendships.filter(
			(f) =>
				(f.requesterId === targetId || f.addresseId === targetId) &&
				f.status === 'ACCEPTED',
		).length;

		const profileData: UserProfile = {
			id: baseUser.id,
			username: baseUser.username,
			role: baseUser.role,
			profile: {
				avatarUrl: baseUser.profile.avatarUrl ?? undefined,
				coverUrl: baseUser.profile.coverUrl ?? undefined,
				bio: baseUser.profile.bio ?? undefined,
			},
			friendsCount,
			friendshipStatus,
		};

		setUserData(profileData);
		if (friendshipStatus === 'BLOCKED') {
			setBlockedPosts(true);
		} else {
			setBlockedPosts(false);
		}
	};

	const loadPosts = async () => {
		if (!id) return;
		const data = await fetchUserPosts(Number(id));
		setPosts(data);
	};

	const loadTournamentPosts = async () => {
		if (!id) return;
		const data = await fetchUserTournamentPosts(Number(id));
		setTournamentPosts(data);
	};

	useEffect(() => {
		fetchProfile();
		loadPosts();
		loadTournamentPosts();
	}, [id]);

	useEffect(() => {
		if (user && userData && user.id === userData.id) {
			navigate('/myprofile', { replace: true });
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
			showModal(t('friends.removed'));
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
		emit('send_friend_request', { requesterId: user?.id, addresseId: Number(id) });
	};

	const handleCancelRequest = async () => {
		if (!userData) return;
		setLoading(true);
		emit('unsend_friend_request', { requesterId: user?.id, addresseId: Number(id) });
	};

	const handleAccept = async () => {
		if (!userData) return;
		setLoading(true);
		emit('accept_friend_request', { requesterId: Number(id), addresseId: user?.id });
	};

	const handleReject = async () => {
		if (!userData) return;
		setLoading(true);
		emit('reject_friend_request', { requesterId: Number(id), addresseId: user?.id });
	};

	const handleRemoveFriend = async () => {
		if (!userData) return;
		setLoading(true);
		emit('remove_friend', { userId: user?.id, friendId: userData.id });
		setShowDeleteConfirm(false);
	};

	const renderFriendshipButton = () => {
		if (!userData) return null;

		const buttonClass =
			'px-3 py-2 text-sm bg-gray-600/30 border-none rounded-lg cursor-pointer opacity-70 hover:opacity-100 hover:bg-gray-500/30 transition-opacity outline-none';

		switch (userData.friendshipStatus) {
			case 'NONE':
				return (
					<button className={buttonClass} onClick={handleAddFriend} disabled={loading}>
						{t('friends.addfriend')}
					</button>
				);
			case 'PENDING_SENT':
				return (
					<button
						className={buttonClass}
						onClick={handleCancelRequest}
						disabled={loading}
					>
						{t('friends.cancelrequest')}
					</button>
				);
			case 'PENDING_RECEIVED':
				return (
					<div className="flex gap-3">
						<button className={buttonClass} onClick={handleAccept} disabled={loading}>
							{t('friends.acceptrequest')}
						</button>
						<button className={buttonClass} onClick={handleReject} disabled={loading}>
							{t('friends.rejectrequest')}
						</button>
					</div>
				);
			case 'ACCEPTED':
				return (
					<div className="flex gap-3">
						<button
							className={buttonClass}
							onClick={() => navigate(`/chat?with=${userData?.id}`)}
							disabled={loading}
						>
							{t('userprofile.sendmessage')}
						</button>
						<button
							className={buttonClass}
							onClick={() => setShowDeleteConfirm(true)}
							disabled={loading}
						>
							{t('friends.remove')}
						</button>
						{showDeleteConfirm && (
							<ConfirmBlockDelete
								message={t('friends.confirmremove')}
								onYes={handleRemoveFriend}
								onNo={() => setShowDeleteConfirm(false)}
							/>
						)}
					</div>
				);
			case 'BLOCKED':
				return <span> </span>;
			default:
				return null;
		}
	};

	if (blockedByUser) {
		return (
			<div className="fixed top-[50px] left-[60px] flex flex-col w-[calc(100vw-60px)] h-[calc(100vh-50px)] text-gray-800 items-center justify-start pt-8">
				{t('userprofile.noaccess')}
			</div>
		);
	}
	if (!userData) {
		return (
			<div className="fixed top-[50px] left-[60px] flex flex-col w-[calc(100vw-60px)] h-[calc(100vh-50px)] text-gray-800 items-center justify-center">
				{t('userprofile.loading')}
			</div>
		);
	}

	return (
		<div className="fixed top-[50px] left-[60px] flex flex-col w-[calc(100vw-60px)] h-[calc(100vh-50px)] text-gray-800 overflow-y-auto">
			{/* MAIN CONTENT */}
			<div className="flex flex-1">
				{/* PROFILE INFO COLUMN */}
				<div className="flex-shrink-0 w-[250px] min-w-[150px] bg-white/85 backdrop-blur-md p-6 flex flex-col items-center rounded-2xl border border-black/5 shadow-md m-5 gap-4 self-stretch max-lg:hidden">
					<UserProfileMenu userId={userData.id} onAction={fetchProfile} />
					<div className="flex items-center gap-2 text-sm self-start pl-2">
						{isOnline ? <span>☀️</span> : <span className="grayscale">🌙</span>}
						<span>{isOnline ? t('userprofile.online') : t('userprofile.offline')}</span>
					</div>
					<div>
						<img
							src={
								userData.profile?.avatarUrl
									? `${BASE_URL}${userData.profile.avatarUrl}`
									: '/transcendence/default-avatar.jpeg'
							}
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									'/transcendence/default-avatar.jpeg';
							}}
							alt="Profile Avatar"
							className="w-24 h-24 rounded-full object-cover shadow-md"
						/>
					</div>
					<p className="font-bold" style={{ fontFamily: "'Gotham Bold', sans-serif" }}>
						<UserNameWithRole
							username={userData.username}
							role={(userData as any).role}
						/>
					</p>
					<div className="flex justify-center gap-2 w-full">
						<span className="bg-gray-100/90 rounded-xl px-4 py-2 flex flex-col items-center text-sm flex-1 shadow-sm">
							<strong className="text-lg font-bold">{userData.friendsCount}</strong>
							{t('userprofile.friends')}
						</span>
						<span className="bg-gray-100/90 rounded-xl px-4 py-2 flex flex-col items-center text-sm flex-1 shadow-sm">
							<strong className="text-lg font-bold">{posts.length}</strong>
							{t('userprofile.posts')}
						</span>
					</div>
					<div className="text-center p-3 rounded-xl w-full bg-white/90 shadow-sm border border-black/5 text-sm whitespace-pre-line">
						<p>{userData.profile?.bio || t('userprofile.writebio')}</p>
					</div>
				</div>

				{/* COVER, USER INTERACTIONS AND POSTS*/}
				<div className="relative flex-1 min-w-0 flex flex-col mt-5">
					{/* Gradient overlay */}
					<div className="absolute top-0 left-0 w-full h-[250px] bg-gradient-to-b from-transparent to-gray-300/70 pointer-events-none z-[1]"></div>

					{/* Cover */}
					<div className="relative h-[250px] overflow-hidden rounded-2xl group">
						<img
							src={
								userData.profile?.coverUrl
									? `${BASE_URL}${userData.profile.coverUrl}`
									: '/transcendence/default-cover.jpeg'
							}
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									'/transcendence/default-cover.jpeg';
							}}
							alt="Cover"
							className="w-full h-full object-cover"
						/>
						<div className="absolute bottom-3 right-3 z-[5]">
							{renderFriendshipButton()}
						</div>
					</div>

					{/* Posts section */}
					<div className="relative z-[1] p-4">
						{blockedPosts ? (
							<div className="flex justify-center mt-12 text-lg">
								{t('userprofile.userblocked')}
							</div>
						) : (
							<>
								{/* Toolbar with tabs */}
								<div className="flex items-center justify-center gap-4 mb-4 relative">
									{/* Tabs */}
									<div className="relative flex rounded-lg overflow-hidden bg-white shadow-sm">
										{/* Indicator */}
										<div
											className={`absolute top-0 left-0 w-1/2 h-full bg-neutral-200 rounded-lg transition-transform duration-300 ease-in-out z-[1] ${
												profileTab === 'posts'
													? 'translate-x-0'
													: 'translate-x-full'
											}`}
										></div>
										<button
											className={`relative z-[2] px-5 py-2 text-sm bg-transparent border-none cursor-pointer min-w-[120px] outline-none ${
												profileTab === 'posts' ? 'font-semibold' : ''
											}`}
											style={
												profileTab === 'posts'
													? {
															fontFamily: "'Gotham Bold', sans-serif",
															fontWeight: '700',
														}
													: {}
											}
											onClick={() => setProfileTab('posts')}
										>
											{t('userprofile.posts')}
										</button>
										<button
											className={`relative z-[2] px-5 py-2 text-sm bg-transparent border-none cursor-pointer min-w-[120px] outline-none ${
												profileTab === 'tournament' ? 'font-semibold' : ''
											}`}
											style={
												profileTab === 'tournament'
													? {
															fontFamily: "'Gotham Bold', sans-serif",
															fontWeight: '700',
														}
													: {}
											}
											onClick={() => setProfileTab('tournament')}
										>
											{t('tournament.tournament')}
										</button>
									</div>
								</div>
								{/* Posts list */}
								{profileTab === 'posts' && <UserPostsList posts={posts} />}
								{profileTab === 'tournament' && (
									<UserPostsList posts={tournamentPosts} />
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfilePage;
