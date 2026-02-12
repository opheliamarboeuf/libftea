import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext, User } from "./context/UserContext";
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import FeedPage from "./pages/FeedPage";
import FriendsPage from "./pages/FriendsPage";
import { Header } from './components/Header';
import { LeftMenu } from './components/LeftMenu';
import UserProfilePage from './pages/UserProfilePage';

const App = () => {

const [user, setUser] = useState<User | null>(null);
const token = localStorage.getItem("token");
const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token)
      {
        setLoading(false);
        return;
      }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
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
      finally{
        setLoading(false);
      }
    }
      fetchUser()
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
            path = "/profile"
            element = {loading ? null : user ? <ProfilePage/> : <Navigate to = "/" replace />} />
		  <Route
			path="/friends"
			element={loading ? null : user ? <FriendsPage/> : <Navigate to = "/" replace />} />
        <Route
            path = "/feed"
            element = {loading ? null : user ? <FeedPage/> : <Navigate to = "/" replace />} />
		<Route
			path="/users/:id"
			element={loading ? null : user ? <UserProfilePage/> : <Navigate to = "/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App
