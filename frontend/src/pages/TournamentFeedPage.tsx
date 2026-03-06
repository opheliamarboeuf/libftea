import "./TournamentFeedPage.css"
import "../App.css"
import { useUser, Post } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPostsList } from "../posts/components/UserPostsList";
import { CreateTournamentModal } from "../tournament/components/CreateTournamentModal";
import { tournamentApi } from "../tournament/api";

const TournamentFeedPage = () => {

	const { user } = useUser();
	const [battle, setBattle] = useState<any | null | undefined>(undefined);
	const [posts, setPosts] = useState<Post[]>([]);

	const [showPostModal, setShowPostModal] = useState<boolean>(false);
	const [battleError, setBattleError] = useState<string | null>(null);

	const refresh = () => {
		if (!battle) return;
		tournamentApi.getBattlePosts(battle.id)
			.then((data) => {
				setPosts(data);
			})
			.catch((err) => {
				console.error("Failed to fetch posts:", err);
			});
	};

	useEffect(() => {
		// load current tournament on mount
		tournamentApi.getCurrentTournament()
			.then((data) => {
				setBattle(data);
				setBattleError(null);
			})
			.catch((err) => {
				console.error("failed to fetch current tournament", err);
				setBattle(null);
			});
	}, []);

	useEffect(() => {
    if (!battle) return;
    refresh();
  }, [battle]);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="tournament-page">
			{!battle ? ( 
				<div className= "no-tournament">
					<h2>No active tournament</h2>
				</div>
			) : (
				<>
					<div className="tournament-header">
						<div className="tournament-theme">
							<h2>{battle.theme}</h2>
							<p>
								{new Date(battle.endsAt).toLocaleDateString()}
							</p>
					</div>

					<div className="tournament-center">
						<button className="expand-btn expand-btn-left" onClick={() => setShowPostModal(true)}>
							<span className="icon">＋</span>
							<span className="expand-btn-text">Enter the contest</span>
						</button>
					</div>
				</div>
			{battleError && <p style={{ color: "red" }}>{battleError}</p>}
			<UserPostsList posts={posts} onPostDeleted={refresh} />
			{showPostModal && (
			<CreateTournamentModal
				battleId={battle?.id ?? 0}
				onJoined={refresh}
				onClose={() => setShowPostModal(false)}
			/>
		)}
		</>
		)}
		</div>
	);
};

export default TournamentFeedPage;