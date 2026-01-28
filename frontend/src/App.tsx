import { useState } from 'react';
import './App.css';

function App() {
  const API_URL = 'http://localhost:3000';

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Get me state
  const [meData, setMeData] = useState<any>(null);
  const [meMsg, setMeMsg] = useState('');

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRegisterMsg('✓ Register successful! Token: ' + data.access_token);
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        setRegisterMsg('✗ Error: ' + (data.message || 'Registration failed'));
      }
    } catch (err) {
      setRegisterMsg('✗ Network error: ' + (err as Error).message);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLoginMsg('✓ Login successful! Token: ' + data.access_token);
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginMsg('✗ Error: ' + (data.message || 'Login failed'));
      }
    } catch (err) {
      setLoginMsg('✗ Network error: ' + (err as Error).message);
    }
  };

  // Get me handler
  const handleGetMe = async () => {
    if (!token) {
      setMeMsg('✗ No token found. Login first!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMeData(data);
        setMeMsg('✓ User data fetched successfully!');
      } else {
        setMeMsg('✗ Error: ' + (data.message || 'Failed to fetch user data'));
      }
    } catch (err) {
      setMeMsg('✗ Network error: ' + (err as Error).message);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMeData(null);
    setMeMsg('');
  };

  return (
    <div className="app">
      <h1>🧪 Backend Testing Panel</h1>

      <div className="container">
        {/* Register Section */}
        <div className="form-section">
          <h2>📝 Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (Strong password required)"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>
          {registerMsg && <p className={registerMsg.startsWith('✓') ? 'success' : 'error'}>{registerMsg}</p>}
        </div>

        {/* Login Section */}
        <div className="form-section">
          <h2>🔐 Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          {loginMsg && <p className={loginMsg.startsWith('✓') ? 'success' : 'error'}>{loginMsg}</p>}
        </div>

        {/* User Data Section */}
        <div className="form-section">
          <h2>👤 User Data</h2>
          <p>Current Token: {token ? token.slice(0, 20) + '...' : 'No token'}</p>
          <button onClick={handleGetMe} disabled={!token}>
            Get My Data
          </button>
          {token && <button onClick={handleLogout} className="logout-btn">Logout</button>}
          {meMsg && <p className={meMsg.startsWith('✓') ? 'success' : 'error'}>{meMsg}</p>}
          {meData && (
            <div className="user-data">
              <p><strong>ID:</strong> {meData.id}</p>
              <p><strong>Username:</strong> {meData.username}</p>
              <p><strong>Email:</strong> {meData.email}</p>
              <p><strong>Role:</strong> {meData.role}</p>
              <p><strong>Created:</strong> {new Date(meData.createdAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
