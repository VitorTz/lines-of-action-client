import { useEffect, useState } from "react";
import BotsTab from "../components/BotsTab";
import type { PageType } from "../types/general";
import "./LobbyPage.css";
import { useSocket } from "../socket/useSocket";
import { useNotification } from "../components/notification/NotificationContext";
import { useAuth } from "../components/auth/AuthContext";
import PlayersTab from "../components/PlayersTab";


type ActiveTab = "players" | "bots";


interface LobbyPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LobbyPage = ({ navigate }: LobbyPageProps) => {
  
  const { addNotification } = useNotification()  
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>("players");
  const [searching, setSearching] = useState(false)
  const socket = useSocket()

  useEffect(() => {    

    socket.on('lobby-cancelled', (msg) => {
        addNotification({
          title: msg,
          type: "success"
        })
    })    
    
    return () => { socket.emit('handleCancelLobby') }
  }, []);

  const handleEnterLobby = () => {
    setSearching(true)
    if (!user) { 
      addNotification({
        title: "Não foi possível concluir a ação",
        message: "Você precisa estar logado",
        duration: 5000,
        type: "error"
      })
      setSearching(false)
      return
    }
    socket.emit("join-lobby", {playerId: user.id, rank: user.rank})
  }

  return (
    <div className="app-container">
      <div className="lobby-card">
        <header className="lobby-header">
          <h1>Escolha seu oponente</h1>
        </header>

        <nav className="lobby-nav">
          <button
            onClick={() => setActiveTab("players")}
            className={`tab-button ${
              activeTab === "players" ? "tab-active" : ""
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("bots")}
            className={`tab-button ${activeTab === "bots" ? "tab-active" : ""}`}
          >
            Bots
          </button>
        </nav>

        <main className="lobby-content">
          {activeTab === "players" && <PlayersTab navigate={navigate} />}
          {activeTab === "bots" && <BotsTab navigate={navigate} />}
        </main>

        {activeTab === "players" && (
          <>
          {
            searching ?
            <footer className="lobby-footer">
              <button 
                className="btn btn-accent">
                Procurando adversários
              </button>
            </footer>
            :
            <footer className="lobby-footer">
              <button 
                onKeyDown={handleEnterLobby}
                className="btn btn-accent">
                Entrar na fila
              </button>
            </footer>
          }
          </>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
