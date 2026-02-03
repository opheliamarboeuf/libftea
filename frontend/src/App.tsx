import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token)
      return;

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
    }
      fetchUser()
  }, [token]);


  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/"
          element={user ? <Navigate to = "/profile"/>: <LoginPage />} />
        <Route
          path="/register"
          element={<RegisterPage />} />
        <Route
          path = "/profile"
          element = {user ? <ProfilePage/> : <Navigate to = "/"/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
