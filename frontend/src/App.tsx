import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { LoginSwitcher } from './mockData/LoginSwitcher';
import GithubCallbackPage from './pages/GithubCallbackPage';
import { seedDatabase, mockDatabase } from './mockData';

seedDatabase();

const App = () => {
	const [user, setUser] = useState<User | null>(
		toContextUser(mockDatabase.users.find((u) => u.username === 'ophe')!),
	);

	// refreshUser
	const refreshUser = async () => {
		const fresh = mockDatabase.users.find((u) => u.id === user?.id);
		if (fresh) setUser(toContextUser(fresh));
	};

	return (
		<UserContext.Provider value={{ user, setUser, refreshUser }}>
			<ModalProvider>
				<BrowserRouter basename="/transcendence" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
					<Header />
					<LeftMenu />
					// LoginSwitcher
					<LoginSwitcher
						users={mockDatabase.users}
						currentUser={user}
						onSwitch={(base) => setUser(toContextUser(base))}
					/>
					;
					<Routes>
						{ModerationRoutes}
						{SettingsRoutes}
						<Route path="/" element={<Navigate to={user ? '/feed' : '/landing'} />} />
						<Route path="/landing" element={<LandingPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route
							path="/transcendence/myprofile"
							element={user ? <MyProfilePage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/friends"
							element={user ? <FriendsPage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/feed"
							element={user ? <FeedPage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/users/:id"
							element={user ? <UserProfilePage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/chat"
							element={user ? <ChatPage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/tournament"
							element={user ? <TournamentFeedPage /> : <Navigate to="/" replace />}
						/>
						<Route
							path="/dashboard"
							element={user ? <DashboardPage /> : <Navigate to="/" replace />}
						/>
						<Route path="/privacypolicy" element={<PrivacyPage />} />
						<Route path="/termsofservice" element={<TermsPage />} />
						<Route path="/github/callback" element={<GithubCallbackPage />} />
					</Routes>
				</BrowserRouter>
			</ModalProvider>
		</UserContext.Provider>
	);
};

export default App;
