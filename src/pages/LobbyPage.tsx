import { useEffect, useState, useRef } from "react";
import BotsTab from "../components/BotsTab";
import type { PageType } from "../types/general";
import { useSocket } from "../socket/useSocket";
import { useNotification } from "../components/notification/NotificationContext";
import { useAuth } from "../components/auth/AuthContext";
import { useLobby } from "../context/LobbyContext";
import MatchFoundModal from "../components/MatchFountModal";
import LobbyChat from "../components/LobbyChat";
import "./LobbyPage.css";

type ActiveTab = "players" | "bots";

interface LobbyPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const MATCH_TIMEOUT_SECONDS = 25;

const LobbyPage = ({ navigate }: LobbyPageProps) => {
  const socket = useSocket();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<ActiveTab>("players");

  const { onQueue, setOnQueue, matchData, setMatchData } = useLobby();

  const [timeRemaining, setTimeRemaining] = useState(MATCH_TIMEOUT_SECONDS);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const timerRef = useRef<any>(null);
  const matchAcceptedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (matchData && !matchAcceptedRef.current) {
      setShowMatchModal(true);
      setTimeRemaining(MATCH_TIMEOUT_SECONDS);
      matchAcceptedRef.current = false;
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            handleDeclineMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [matchData]);

  useEffect(() => {
    // Handler: saiu da fila
    socket.on("exit-queue", () => {
      setOnQueue(false);
      setMatchData(null);
      setShowMatchModal(false);
      clearTimer();
    });

    // Handler: oponente cancelou
    socket.on("match-cancelled-by-opponent", () => {
      addNotification({
        title: "Seu oponente cancelou a partida",
        type: "info",
      });
      setMatchData(null);
      setOnQueue(false);
      setShowMatchModal(false);
      clearTimer();
      matchAcceptedRef.current = false;
    });

    // Handler: entrou na fila
    socket.on("on-queue", () => {
      setOnQueue(true);
    });

    // Handler: partida encontrada
    socket.on("match-found", (data) => {
      setMatchData(data);
      matchAcceptedRef.current = false;
    });

    // Handler: jogo iniciado
    socket.on("game-start", (data) => {
      console.log("Jogo iniciado:", data);
      clearTimer();
      setShowMatchModal(false);
      setOnQueue(false);
      navigate("game-player", {
        gameId: data.gameId,
        color: data.color,
      });
    });

    return () => {
      socket.off("exit-queue");
      socket.off("match-cancelled-by-opponent");
      socket.off("num-players-on-lobby");
      socket.off("on-queue");
      socket.off("match-found");
      socket.off("game-start");
      if (user) {
        socket.emit("exit-queue", { playerId: user.id });
      }
      clearTimer();
    };
  }, [user, socket]);

  const handleJoinQueue = () => {
    if (!user) {
      addNotification({
        title: "Não foi possível concluir a ação",
        message: "Você precisa estar logado",
        duration: 5000,
        type: "error",
      });
      return;
    }
    socket.emit("join-queue", { playerId: user.id, rank: user.rank });
  };

  const handleExitQueue = () => {
    if (!user) {
      addNotification({
        title: "Não foi possível concluir a ação",
        message: "Você precisa estar logado",
        duration: 5000,
        type: "error",
      });
      return;
    }
    socket.emit("exit-queue", { playerId: user.id });
  };

  const handleAcceptMatch = () => {
    if (!user || !matchData) return;

    matchAcceptedRef.current = true;
    clearTimer();

    socket.emit("match-ready", {
      playerId: user.id,
      gameId: matchData.gameId,
    });

    setTimeRemaining(-1);
  };

  const handleDeclineMatch = () => {
    if (!user) return;

    matchAcceptedRef.current = false;
    clearTimer();
    setShowMatchModal(false);
    setMatchData(null);

    socket.emit("exit-queue", { playerId: user.id });

    addNotification({
      title: "Você recusou a partida",
      type: "info",
    });
  };

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
            Pessoas
          </button>
          <button
            onClick={() => setActiveTab("bots")}
            className={`tab-button ${activeTab === "bots" ? "tab-active" : ""}`}
          >
            Bots
          </button>
        </nav>

        <main className="lobby-content">
          {activeTab === "players" && (
            <div className="players-tab-content">
              {/* Área de Status da Fila */}
              <div className="queue-status-area">
                {onQueue ? (
                  <div className="queue-status">
                    <div className="spinner"></div>
                    <h2>Procurando Oponente...</h2>
                  </div>
                ) : (
                  <div className="queue-status">
                    <p className="queue-description">
                      Entre na fila para ser pareado com jogadores do seu nível.
                    </p>
                  </div>
                )}
              </div>

              <div className="lobby-chat-wrapper">
                <LobbyChat />
              </div>
            </div>
          )}

          {activeTab === "bots" && <BotsTab navigate={navigate} />}
        </main>

        {activeTab === "players" && (
          <>
            {onQueue ? (
              <footer className="lobby-footer">
                <button onClick={handleExitQueue} className="btn btn-accent">
                  Sair da fila
                </button>
              </footer>
            ) : (
              <footer className="lobby-footer">
                <button onClick={handleJoinQueue} className="btn btn-accent">
                  Entrar na fila
                </button>
              </footer>
            )}
          </>
        )}
      </div>

      {/* Modal de Partida Encontrada */}
      {showMatchModal && matchData && (
        <MatchFoundModal
          matchData={matchData}
          timeRemaining={timeRemaining}
          handleAcceptMatch={handleAcceptMatch}
          handleDeclineMatch={handleDeclineMatch}
        />
      )}
    </div>
  );
};

export default LobbyPage;
