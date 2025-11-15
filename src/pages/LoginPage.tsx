import type { PageType } from "../types/general";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import './AuthPage.css'


interface LoginPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('lobby');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Login</button>
        </form>
        <p>
          Don’t have an account?{' '}
          <a onClick={() => navigate('signup')}>Sign up.</a>
        </p>
      </div>
    </div>
  );
};


export default LoginPage;