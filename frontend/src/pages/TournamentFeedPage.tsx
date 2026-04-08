import './TournamentFeedPage.css';
import '../App.css';
import { useUser, Post } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPostsList } from '../posts/components/UserPostsList';
import { JoinTournamentModal } from '../tournament/components/JoinTournamentModal';
import { CreateTournamentModal } from '../tournament/components/CreateTournamentModal';
import { useTranslation } from 'react-i18next';
import { mockDatabase } from '../mockData';

const toContextPost = (postId: number): Post | null => {
	const p = mockDatabase.posts.find((x) => x.id === postId);
	if (!p) return null;
	const author = mockDatabase.users.find((u) => u.id === p.authorId);
	return {
		id: p.id,
		title: p.title,
		caption: p.caption,
		imageUrl: p.imageUrl,
		createdAt: p.createdAt.toISOString(),
		updatedAt: p.updatedAt.toISOString(),
		author: {
			id: author?.id ?? p.authorId,
			username: author?.username ?? '',
			role: author?.role,
		},
		likes: p.likes?.length ?? 0,
		battleParticipants: [],
	};
};

const TournamentFeedPage = () => {
	const { user } = useUser();
	const [battle, setBattle] = useState<any | null>(
		() =>
			mockDatabase.battles.find((b) => b.status === 'ONGOING' || b.status === 'UPCOMING') ??
			null,
	);
	const [posts, setPosts] = useState<Post[]>(() => {
		const current = mockDatabase.battles.find(
			(b) => b.status === 'ONGOING' || b.status === 'UPCOMING',
		);
		if (!current) return [];
		return mockDatabase.battleParticipants
			.filter((bp) => bp.battleId === current.id)
			.map((bp) => {
				const post = toContextPost(bp.postId);
				if (post) {
					return {
						...post,
						battleParticipants: [{ Battle: { theme: current.theme } }],
					};
				}
				return null;
			})
			.filter((p): p is any => p !== null)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	});

	const [showPostModal, setShowPostModal] = useState<boolean>(false);
	const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);
	const [battleError, setBattleError] = useState<string | null>(null);
	const [winnerPost, setWinnerPost] = useState<any | null>(null);

	const { t, i18n } = useTranslation();

	const refresh = () => {
		if (!battle) return;
		const participants = mockDatabase.battleParticipants.filter(
			(bp) => bp.battleId === battle.id,
		);
		const battlePosts = participants
			.map((bp) => {
				const post = toContextPost(bp.postId);
				if (post) {
					return {
						...post,
						battleParticipants: [{ Battle: { theme: battle.theme } }],
					};
				}
				return null;
			})
			.filter((p): p is any => p !== null)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		setPosts(battlePosts);
	};

	const refetchBattle = () => {
		const current =
			mockDatabase.battles.find((b) => b.status === 'ONGOING' || b.status === 'UPCOMING') ??
			null;
		setBattle(current);
		setBattleError(null);
	};

	useEffect(() => {
		if (!battle) return;
		refresh();
	}, [battle]);

	useEffect(() => {
		const finished = mockDatabase.battles.find(
			(b) => b.status === 'FINISHED' && b.winnerId != null,
		);
		if (!finished) return;
		const winnerParticipant = mockDatabase.battleParticipants.find(
			(bp) => bp.battleId === finished.id && bp.userId === finished.winnerId,
		);
		if (!winnerParticipant) return;
		const post = toContextPost(winnerParticipant.postId);
		if (post) {
			setWinnerPost({
				...post,
				battleParticipants: [{ Battle: { theme: finished.theme } }],
			});
		}
	}, []);

	const feedPosts = winnerPost
		? [{ ...winnerPost, isWinner: true }, ...posts.filter((p) => p.id !== winnerPost.id)]
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
								const todayStart = new Date(
									now.getFullYear(),
									now.getMonth(),
									now.getDate(),
								);
								const endDateStart = new Date(
									endDate.getFullYear(),
									endDate.getMonth(),
									endDate.getDate(),
								);
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
						<button
							className="expand-btn expand-btn-left"
							onClick={() => setShowPostModal(true)}
						>
							<span className="icon">＋</span>
							<span className="expand-btn-text">{t('tournament.entercontest')}</span>
						</button>
					)}
					{user?.role === 'ADMIN' && (
						<button
							className="expand-btn expand-btn-right"
							onClick={() => setShowCreateTournamentModal(true)}
						>
							<span className="icon">👑</span>
							<span className="expand-btn-text">
								{t('tournament.createtournament')}
							</span>
						</button>
					)}
				</div>
			</div>
			{battle && (
				<>
					<UserPostsList posts={feedPosts} onPostDeleted={refresh} />
					{battleError && <p style={{ color: 'gray' }}>{battleError}</p>}
					{showPostModal && (
						<JoinTournamentModal
							battleId={battle.id}
							onJoined={refresh}
							onClose={() => setShowPostModal(false)}
						/>
					)}
				</>
			)}
			{!battle && winnerPost && <UserPostsList posts={[{ ...winnerPost, isWinner: true }]} />}
			{showCreateTournamentModal && (
				<CreateTournamentModal
					onClose={() => setShowCreateTournamentModal(false)}
					onCreated={() => {
						setShowCreateTournamentModal(false);
						refetchBattle();
					}}
				/>
			)}
		</div>
	);
};

export default TournamentFeedPage;
