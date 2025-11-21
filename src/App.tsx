import { NotificationProvider } from "./components/notification/NotificationProvider";
import { useAuth } from "./components/auth/AuthContext";
import Router from "./components/Router";
import LoadingPage from "./pages/LoadingPage";
import { AuthProvider } from "./components/auth/AuthProvider";
import "./App.css";
import { SocketProvider } from "./socket/SocketProvider";


const AppContent = () => {

  const { loading } = useAuth();

  if (loading) return <LoadingPage />;

  return (
      <Router />
  );
};

const App = () => {
  return (
    <SocketProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </SocketProvider>
  );
};

export default App;
