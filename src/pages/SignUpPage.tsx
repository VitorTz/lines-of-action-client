import type { PageType } from "../types/general";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import './AuthPage.css'


interface SignupPageProps {
  navigate: (page: PageType, data?: any) => void;
}


const SignupPage = ({ navigate }: SignupPageProps) => {
  console.log("iu")
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await signup(username, email, password);
    if (success) {
      navigate('login');
    } else {
      setError('Erro ao criar conta');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="email"
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
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account.?{' '}
          <a onClick={() => navigate('login')}>Sign In</a>
        </p>
      </div>
    </div>
  );
};


export default SignupPage;