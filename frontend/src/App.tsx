import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext, User } from "./context/UserContext";
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyProfilePage from './pages/MyProfilePage';
import FeedPage from "./pages/FeedPage";
import FriendsPage from "./pages/FriendsPage";
import { Header } from './common/components/Header';
import { LeftMenu } from './common/components/LeftMenu';
import UserProfilePage from './pages/UserProfilePage';
import { ModalProvider } from "./context/ModalContext";
import ChatPage from './pages/ChatPage';

const App = () => {

const [user, setUser] = useState<User | null>(null);
const token = localStorage.getItem("token");
const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (!res.ok){
        localStorage.removeItem("token");
        throw new Error("Token invalid or user unauthorized");
      }
      const data = await res.json();
      setUser(data);
    }
    catch(err){
      console.log("Fetch error:", (err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const initUser = async () => {
      await fetchUser();
      setLoading(false);
    };
    initUser();
  }, [token, fetchUser]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: fetchUser }}>
      <ModalProvider>
      <BrowserRouter>
        <Header />
        <LeftMenu />
          <Routes>
            <Route 
              path="/"
              element={loading ? null : <Navigate to = {user ? "/feed" : "/login"} replace/>} />
            <Route
              path="/register"
              element={<RegisterPage />} />
            <Route
              path = "/login"
              element = {<LoginPage />} />
            <Route
              path = "/myprofile"
              element = {loading ? null : user ? <MyProfilePage/> : <Navigate to = "/" replace />} />
            <Route
              path="/friends"
              element={loading ? null : user ? <FriendsPage/> : <Navigate to = "/" replace />} />
            <Route
              path = "/feed"
              element = {loading ? null : user ? <FeedPage/> : <Navigate to = "/" replace />} />
            <Route
              path="/users/:id"
              element={loading ? null : user ? <UserProfilePage/> : <Navigate to = "/" replace />} />
			<Route
			  path="/chat/:friendId"
			  element={loading ? null :user ? <ChatPage/> : <Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </ModalProvider>
    </UserContext.Provider>
  );
};

export default App
