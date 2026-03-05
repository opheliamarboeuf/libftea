import "./TournamentFeedPage.css"
import "../App.css"
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPostsList } from "../posts/components/UserPostsList";
import { useFeed } from "../posts/hooks/useFeed";
import { CreateTournamentModal } from "../tournament/components/CreateTournamentModal";
import { tournamentApi } from "../tournament/api";

const TournamentFeedPage = () => {

	const { user } = useUser();
	const { posts, error, refresh } = useFeed("all");
	// `battle` is undefined while we are fetching; once the request finishes
// it will either be an object or `null` if there's no active tournament.
const [battle, setBattle] = useState<any | null | undefined>(undefined);
const [showPostModal, setShowPostModal] = useState(false);
const [battleError, setBattleError] = useState<string | null>(null);

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
				setBattleError("Unable to load tournament");
			});
	}, []);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="tournament-page">
			<div className="tournament-header">
				<div className="tournament-theme">
					{ battle ? (
						<>
							<h2>{battle.theme}</h2>
							<p>
								{new Date(battle.endsAt).toLocaleDateString()}
							</p>
						</>
					) : (
						<p>No active tournament</p>
					)}
				</div>
				<div className="tournament-center">
					<button className="expand-btn expand-btn-left" onClick={() => setShowPostModal(true)}>
						<span className="icon">＋</span>
					   <span className="expand-btn-text">Enter the contest</span>
					</button>
				</div>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}
			<UserPostsList posts={posts} onPostDeleted={refresh} />
			{showPostModal && (
			<CreateTournamentModal
				battleId={battle?.id ?? 0}
				onJoined={refresh}
				onClose={() => setShowPostModal(false)}
			/>
		)}
		</div>
	);
};

export default TournamentFeedPage;