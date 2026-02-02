import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Read token from localStorage → if absent, show login
// If token exists → make a fetch to /auth/me
// If fetch succeeds → save user info in state → redirect to /profile
// If fetch fails (401) → clear token → show login

// Pages 
const RegisterPage = () => <h1>Register Page </h1>;
const LoginPage = () => <h1>Login Page</h1>;
const ProfilePage = () => <h1>Profile Page</h1>;

const App = () => {
  const token = localStorage.getItem("token");
  useEffect(() => {
    // fetch()
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/"
          element={token ? <Navigate to = "/profile"/>: <LoginPage />} />
        <Route
          path="/register"
          element={<RegisterPage />} />
        <Route
          path = "/profile"
          element = {token ? <ProfilePage/> : <Navigate to = "/"/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
