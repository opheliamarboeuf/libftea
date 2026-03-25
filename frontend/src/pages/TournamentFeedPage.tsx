import "./TournamentFeedPage.css"
import "../App.css"
import { useUser, Post } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPostsList } from "../posts/components/UserPostsList";
import { JoinTournamentModal } from "../tournament/components/JoinTournamentModal";
import { CreateTournamentModal } from "../tournament/components/CreateTournamentModal";
import { tournamentApi } from "../tournament/api";
import { useTranslation } from "react-i18next";

const TournamentFeedPage = () => {

	const { user } = useUser();
	const [battle, setBattle] = useState<any | null | undefined>(undefined);
	const [posts, setPosts] = useState<Post[]>([]);

	const [showPostModal, setShowPostModal] = useState<boolean>(false);
	const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);
	const [battleError, setBattleError] = useState<string | null>(null);
	const [winnerPost, setWinnerPost] = useState<any | null>(null);

	const { t, i18n } = useTranslation();

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

	const refetchBattle = () => {
		tournamentApi.getCurrentTournament()
			.then((data) => {
				setBattle(data);
				setBattleError(null);
			})
			.catch((err) => {
				console.error("failed to fetch current tournament", err);
				setBattle(null);
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

  useEffect(() => {
	tournamentApi.getLastWinnerPost()
		.then((data) => setWinnerPost(data))
		.catch((err) => {
			console.warn("No last winner post:", err.message);
		});
  }, []);

  	const feedPosts = winnerPost
    ? [{ ...winnerPost, isWinner: true }, ...posts.filter(p => p.id !== winnerPost.id)]
    : posts;

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="tournament-page">
			<div className="tournament-header">
				{battle && (
					<div className="tournament-theme">
						<h2>{battle.theme}</h2>
							<p>
								{(() => {
									const now = new Date();
									const endDate = new Date(battle.endsAt);									
									const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
									const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
									const diffTime = endDateStart.getTime() - todayStart.getTime();
									const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

									if (diffDays < 0) return t('tournament.ended');
									if (diffDays === 0) return t('tournament.today');
									if (diffDays === 1) return t('tournament.tomorrow');
									return t('tournament.days', {
										count: diffDays,
										date: endDate.toLocaleDateString(i18n.language),
									});
								})()}
							</p>
					</div>
					)}
					{!battle && ( 
						<div className="no-tournament-message">
							<h2>{t('tournament.notournament')}</h2>
						</div>
					)}
					<div className="tournament-center">
						{battle && (
							<button className="expand-btn expand-btn-left" onClick={() => setShowPostModal(true)}>
								<span className="icon">＋</span>
								<span className="expand-btn-text">{t('tournament.entercontest')}</span>
							</button>
						)}
						{user?.role === "ADMIN" && (
							<button className="expand-btn expand-btn-right" onClick={() => setShowCreateTournamentModal(true)}>
								<span className="icon">👑</span>
								<span className="expand-btn-text">{t('tournament.createtournament')}</span>
							</button>
						)}
					</div>
				</div>
			{battle && (
				<>
					<UserPostsList posts={feedPosts} onPostDeleted={refresh} />
					{battleError && <p style={{ color: "gray" }}>{battleError}</p>}
					{
						showPostModal && (
						<JoinTournamentModal
							battleId={battle.id}
							onJoined={refresh}
							onClose={() => setShowPostModal(false)} />
					)}
				</>
			)}
			{!battle && winnerPost && (
				<UserPostsList posts={[{ ...winnerPost, isWinner: true }]} />
			)}
			{
				showCreateTournamentModal && (
				<CreateTournamentModal
					onClose={() => setShowCreateTournamentModal(false)}
					onCreated={() => {setShowCreateTournamentModal(false);
					refetchBattle();
				}}
			/>
			)}
		</div>
	);
};

export default TournamentFeedPage;