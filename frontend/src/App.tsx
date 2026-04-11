import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserContext, User } from './context/UserContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyProfilePage from './pages/MyProfilePage';
import FeedPage from './pages/FeedPage';
import FriendsPage from './pages/FriendsPage';
import { Header } from './common/components/Header';
import { LeftMenu } from './common/components/LeftMenu';
import UserProfilePage from './pages/UserProfilePage';
import { ModalProvider } from './context/ModalContext';
import { ModerationRoutes } from './moderation/routes/ModerationRoutes';
import { SettingsRoutes } from './settings/SettingsRoute';
import TournamentFeedPage from './pages/TournamentFeedPage';
import { ChatPage } from './pages/ChatPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { toContextUser } from './mockData/mockUser';
import GithubCallbackPage from './pages/GithubCallbackPage';
import { seedDatabase, mockDatabase } from './mockData';

seedDatabase();

const AppContent = () => {
	const location = useLocation();
	
	// Pages that shouldn't show header and left menu
	const publicPages = ['/landing', '/login', '/register', '/privacypolicy', '/termsofservice', '/github/callback'];
	const shouldShowLayout = !publicPages.includes(location.pathname);

	return (
		<>
			{shouldShowLayout && <Header />}
			{shouldShowLayout && <LeftMenu />}
			<Routes>
				{ModerationRoutes}
				{SettingsRoutes}
			<Route path="/" element={<Navigate to="/landing" />} />
				<Route path="/landing" element={<LandingPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/myprofile"
					element={<MyProfilePage />}
				/>
				<Route
					path="/friends"
					element={<FriendsPage />}
				/>
				<Route
					path="/feed"
					element={<FeedPage />}
				/>
				<Route
					path="/users/:id"
					element={<UserProfilePage />}
				/>
				<Route
					path="/chat"
					element={<ChatPage />}
				/>
				<Route
					path="/tournament"
					element={<TournamentFeedPage />}
				/>
				<Route
					path="/dashboard"
					element={<DashboardPage />}
				/>
				<Route path="/privacypolicy" element={<PrivacyPage />} />
				<Route path="/termsofservice" element={<TermsPage />} />
				<Route path="/github/callback" element={<GithubCallbackPage />} />
			</Routes>
		</>
	);
};

const App = () => {
	const storedId = sessionStorage.getItem('userId');
	const initialUser = storedId
		? (() => {
				const found = mockDatabase.users.find((u) => u.id === Number(storedId));
				return found ? toContextUser(found) : null;
		  })()
		: null;

	const [user, setUser] = useState<User | null>(initialUser);

	const setUserWithStorage: React.Dispatch<React.SetStateAction<User | null>> = (action) => {
		setUser((prev) => {
			const next = typeof action === 'function' ? action(prev) : action;
			if (next) sessionStorage.setItem('userId', String(next.id));
			else sessionStorage.removeItem('userId');
			return next;
		});
	};

	// refreshUser
	const refreshUser = async () => {
		const fresh = mockDatabase.users.find((u) => u.id === user?.id);
		if (fresh) setUserWithStorage(toContextUser(fresh));
	};

	return (
		<UserContext.Provider value={{ user, setUser: setUserWithStorage, refreshUser }}>
			<ModalProvider>
				<BrowserRouter
					basename="/libftea"
					future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
				>
					<AppContent />
				</BrowserRouter>
			</ModalProvider>
		</UserContext.Provider>
	);
};

export default App;
