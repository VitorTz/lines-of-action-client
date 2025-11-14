import { useState, useEffect } from 'react';
import type { User } from './types/user';
import { linesApi } from './api/linesApi';
import { AuthContext } from './context/AuthContext';
import Router from './components/Router';
import LoadingPage from './pages/LoadingPage';
import './App.css';


const App = () => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    await linesApi
      .auth
      .me()
      .then(user => setUser(user))
      .catch(err => console.log(err))
    setLoading(false)
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return await linesApi
      .auth
      .login(email, password)
      .then(user => {setUser(user); return true})
      .catch(err => {console.error('Login failed:', err); return false})
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    return await linesApi
      .auth
      .signup(username, email, password)
      .then(() => {return true})
      .catch(err => {console.error('Signup failed:', err); return false;})
  };

  const logout = async () => {
    await linesApi
      .auth
      .logout()
      .then(() => setUser(null))
      .catch(err => console.error('Logout failed:', err))
  };  

  if (loading) { return <LoadingPage />; }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>      
      <Router />
    </AuthContext.Provider>
  );
};


export default App;