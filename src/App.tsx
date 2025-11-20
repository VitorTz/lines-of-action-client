import { useAuth } from './components/auth/AuthContext';
import Router from './components/Router';
import LoadingPage from './pages/LoadingPage';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './components/notification/NotificationProvider';
import { AuthProvider } from './components/auth/AuthProvider';
import './App.css';


const AppContent = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingPage />;

  return (
    <SocketProvider>
      <Router />
    </SocketProvider>
  );
};


const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
};


export default App;