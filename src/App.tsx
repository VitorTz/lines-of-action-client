import { NotificationProvider } from "./components/notification/NotificationProvider";
import { useAuth } from "./components/auth/AuthContext";
import Router from "./components/Router";
import LoadingPage from "./pages/LoadingPage";
import { AuthProvider } from "./components/auth/AuthProvider";
import "./App.css";
import { SocketProvider } from "./socket/SocketProvider";
import { LobbyProvider } from "./context/LobbyContext";
import { useEffect } from "react";
import { useSocket } from "./socket/useSocket";
import { useNotification } from "./components/notification/NotificationContext";
import { GameChatProvider } from "./context/GameChatContext";
import { GlobalChatProvider } from "./context/GlobalChatContext";


const AppContent = () => {

  const socket = useSocket()
  const { addNotification } = useNotification()
  const { loading } = useAuth();

  useEffect(() => {
    
    socket.on('error', (data) => {
      addNotification({
        title: data.message,
        type: "error"
      })
    })

    socket.on('info', (data) => {
      addNotification({
        title: data.message,
        type: "info"
      })
    })

  }, [])

  if (loading) 
    return <LoadingPage />;

  return (
    <Router />
  );
};

const App = () => {
  return (
    <NotificationProvider>
      <SocketProvider>
        <AuthProvider>
          <LobbyProvider>
            <GlobalChatProvider>
              <GameChatProvider>
                <AppContent />
              </GameChatProvider>
            </GlobalChatProvider>
          </LobbyProvider>
        </AuthProvider>
      </SocketProvider>
    </NotificationProvider>
  );
};

export default App;
