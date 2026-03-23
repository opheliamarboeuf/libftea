import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { EditProfileModal, API_URL } from "../profile";
import { CreatePostModal } from "../posts/components/CreatePostModal";
import { Post } from "../context/UserContext";
import { fetchUserPosts, fetchUserTournamentPosts } from "../posts/components/fetchUserPosts";
import { UserPostsList } from "../posts/components/UserPostsList";
import { UserNameWithRole } from "../common/components/UserNameWithRole";

const ProfilePage = () => {
	const { user } = useUser();
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPostModal, setShowPostModal] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [profileTab, setProfileTab] = useState('posts');
	const [tournamentPosts, setTournamentPosts] = useState<Post[]>([]);

	if (!user) return <Navigate to="/" replace />;

	const loadPosts = async () => {
		const data = await fetchUserPosts(user.id);
		setPosts(data);
	};

	const loadTournamentPosts = async () => {
		const data = await fetchUserTournamentPosts(user.id);
		setTournamentPosts(data);
	};

	useEffect(() => {
		loadPosts();
		loadTournamentPosts();
	}, [user]);

	return (
		<div className="fixed top-[50px] left-[60px] flex flex-col w-[calc(100vw-60px)] h-[calc(100vh-50px)] text-gray-800 overflow-y-auto">
			<div className="flex flex-1 h-full">
				<div className="flex-shrink-0 w-[250px] min-w-[150px] bg-white/85 backdrop-blur-md p-6 flex flex-col items-center rounded-2xl border border-black/5 shadow-md m-5 gap-4 self-stretch max-lg:hidden">
					<p className="w-full font-bold text-xl flex justify-center items-center">
						{user.profile.displayName ? user.profile.displayName : '\u00A0'}
					</p>
					<div>
						<img
							src={
								user.profile.avatarUrl
									? `${API_URL}${user.profile.avatarUrl}`
									: '/assets/images/default-avatar.jpeg'
							}
							alt="Profile Avatar"
							className="w-24 h-24 rounded-full object-cover shadow-md"
						/>
					</div>
					<p className="font-bold">
						<UserNameWithRole username={user.username} role={user.role} />
					</p>
					<div className="flex justify-center gap-2 w-full">
						<span className="bg-gray-100/90 rounded-xl px-4 py-2 flex flex-col items-center text-sm flex-1 shadow-sm">
							<strong className="text-lg font-bold">{user.friends?.length ?? 0}</strong>
							Friends
						</span>
						<span className="bg-gray-100/90 rounded-xl px-4 py-2 flex flex-col items-center text-sm flex-1 shadow-sm">
							<strong className="text-lg font-bold">{posts.length}</strong>
							Posts
						</span>
					</div>
					<div className="text-center p-3 rounded-xl w-full bg-white/90 shadow-sm border border-black/5 text-sm whitespace-pre-line">
						<p>{user.profile.bio || "Write your bio here..."}</p>
					</div>
				</div>
				<div className="relative flex-1 min-w-0 flex flex-col mt-5">
					<div className="absolute top-0 left-0 w-full h-[250px] bg-gradient-to-b from-transparent to-gray-300/70 pointer-events-none z-[1]"></div>
					
					<div className="relative h-[250px] overflow-hidden rounded-2xl group">
						<img
							src={
								user.profile?.coverUrl
									? `${API_URL}${user.profile.coverUrl}`
									: '/assets/images/default-cover.jpeg'
							}
							alt="Cover"
							className="w-full h-full object-cover"
						/>
						<button 
							className="absolute bottom-3 right-3 px-3 py-2 text-sm bg-gray-600/30 border-none rounded-lg cursor-pointer opacity-70 hover:opacity-100 hover:bg-gray-500/30 transition-opacity z-[5]"
							onClick={() => setShowEditModal(true)}
						>
							Edit Profile
						</button>
					</div>
					<div className="relative z-[1] flex-1 p-4 overflow-y-auto bg-gray-300/70">
						<div className="flex items-center justify-center gap-4 mb-4 relative">
							<div className="relative flex rounded-lg overflow-hidden bg-white shadow-sm">
								<div 
									className={`absolute top-0 left-0 w-1/2 h-full bg-neutral-200 rounded-lg transition-transform duration-300 ease-in-out z-[1] ${
										profileTab === "posts" ? "translate-x-0" : "translate-x-full"
									}`}
								></div>
								<button
									className={`relative z-[2] px-5 py-2 text-sm bg-transparent border-none cursor-pointer min-w-[120px] outline-none ${
										profileTab === "posts" ? "font-semibold" : ""
									}`}
									style={profileTab === "posts" ? { fontFamily: "'Gotham Bold', sans-serif", fontWeight: "700" } : {}}
									onClick={() => setProfileTab("posts")}
								>
									Posts
								</button>
								<button
									className={`relative z-[2] px-5 py-2 text-sm bg-transparent border-none cursor-pointer min-w-[120px] outline-none ${
										profileTab === "tournament" ? "font-semibold" : ""
									}`}
									style={profileTab === "tournament" ? { fontFamily: "'Gotham Bold', sans-serif", fontWeight: "700" } : {}}
									onClick={() => setProfileTab("tournament")}
								>
									Tournament
								</button>
							</div>
							{profileTab === "posts" && (
								<button 
									className="group flex items-center justify-center w-10 h-10 bg-neutral-400 text-gray-800 rounded-full hover:bg-neutral-600 hover:w-auto hover:px-4 transition-all duration-300 outline-none overflow-hidden"
									onClick={() => setShowPostModal(true)}
								>
									<span>＋</span>
									<span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-300">
										Post an outfit
									</span>
								</button>
							)}
						</div>
						{profileTab === "posts" && (
							<UserPostsList posts={posts} onPostDeleted={loadPosts} />
						)}
						{profileTab === "tournament" && (
							<UserPostsList posts={tournamentPosts} onPostDeleted={loadTournamentPosts} />
						)}
					</div>
				</div>
			</div>
			{showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}
			{showPostModal && (
				<CreatePostModal
					onPostCreated={loadPosts}
					onClose={() => setShowPostModal(false)}
				/>
			)}
		</div>
	);
};

export default ProfilePage;
