import { useState, useEffect } from "react";
import type { PageType } from "../types/general";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignUpPage";
import Header from "./Header";
import Footer from "./Footer";
import AccountPage from "../pages/AccountPage";
import LobbyPage from "../pages/LobbyPage";
import AboutPage from "../pages/AboutPage";
import { useAuth } from "./auth/AuthContext";
import ProjectDescriptionPage from "../pages/ProjectDescriptionPage";
import MatchHistoryPage from "../pages/MatchHistoryPage";
import GameVsBot from "../pages/GameVsBot";
import GlobalChatPage from "../pages/GlobalChat";
import RankPage from "../pages/RankPage";
import GameVsPlayer from "../pages/GameVsPlayer";
import GameReview from "../pages/GameReview";
import { useGlobal } from "../context/GlobalContext";
import { useSocket } from "../socket/useSocket";
import { X, AlertTriangle, LogOut } from "lucide-react"; 
import './Router.css'


const Router = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>("lobby");
  const [pageData, setPageData] = useState<any>(null);
  const { isPlaying, setIsPlaying, gameId, setGameId } = useGlobal();
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    page: PageType;
    data: any;
  } | null>(null);

  const socket = useSocket();

  const handleExitGame = () => {
    if (isPlaying && user) {
      socket.emit("surrender", { gameId, playerId: user.id });
      setGameId(null);
      setIsPlaying(false);
    }
  };

  const pageFromHash = (hash: string): { page: PageType; data?: any } => {
    if (!hash) return { page: "home" as PageType, data: null };
    const clean: string | PageType = hash.replace(/^#/, "");

    if (clean.startsWith("game-bot")) {
      const difficulty = clean.split("-")[2];
      return { page: "game-bot", data: difficulty };
    } else if (clean.startsWith("game-player")) {
      const t = clean.split("-");
      return { page: "game-player", data: { gameId: t[2], color: t[3] } };
    } else if (clean.startsWith("game-review")) {
      const gameId = clean.split("-")[2];
      return { page: "game-review", data: gameId };
    }

    if (clean === "account") return { page: "account", data: null };
    if (clean === "login") return { page: "login", data: null };
    if (clean === "signup") return { page: "signup", data: null };
    if (clean === "match-history") return { page: "match-history", data: null };
    if (clean === "about") return { page: "about", data: null };
    if (clean === "global-chat") return { page: "global-chat", data: null };
    if (clean == "rank") return { page: "rank", data: null };
    return { page: "lobby", data: null };
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  useEffect(() => {
    const initial = pageFromHash(window.location.hash);
    setCurrentPage(initial.page);
    setPageData(initial.data);

    window.history.replaceState(
      { page: initial.page, data: initial.data },
      "",
      window.location.href
    );

    const handlePop = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        setPageData(e.state.data ?? null);
      } else {
        const parsed = pageFromHash(window.location.hash);
        setCurrentPage(parsed.page);
        setPageData(parsed.data);
      }
      window.scrollTo(0, 0);
    };

    const handleHash = () => {
      const parsed = pageFromHash(window.location.hash);
      setCurrentPage(parsed.page);
      setPageData(parsed.data);
      window.history.replaceState(
        { page: parsed.page, data: parsed.data },
        "",
        window.location.href
      );
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handleHash);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const performNavigation = (page: PageType, data: any) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);

    let hash = `#${page}`;

    if (page === "game-bot") {
      hash = `#game-bot-${data}`;
    } else if (page === "game-player") {
      hash = `#game-player-${data.gameId}-${data.color}`;
    } else if (page === "game-review") {
      hash = `#game-review-${data}`;
    }

    window.history.pushState(
      { page, data },
      "",
      `${window.location.pathname}${hash}`
    );
  };

  const navigate = (page: PageType, data: any = null) => {
    if (page === currentPage) return;

    if (isPlaying) {
      setPendingNavigation({ page, data });
      setShowExitModal(true);
    } else {
      performNavigation(page, data);
    }
  };

  const handleConfirmExit = () => {
    handleExitGame();
    setShowExitModal(false);
    if (pendingNavigation) {
      performNavigation(pendingNavigation.page, pendingNavigation.data);
      setPendingNavigation(null);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingNavigation(null);
  };

  const renderPage = () => {
    if (
      !user &&
      ![
        "signup",
        "login",
        "project-description",
        "about",
        "rank",
        "game-review",
      ].includes(currentPage)
    ) {
      return <LoginPage navigate={navigate} />;
    }
    switch (currentPage) {
      case "account":
        return <AccountPage navigate={navigate} />;
      case "global-chat":
        return <GlobalChatPage navigate={navigate} />;
      case "lobby":
        return <LobbyPage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} />;
      case "signup":
        return <SignupPage navigate={navigate} />;
      case "project-description":
        return <ProjectDescriptionPage navigate={navigate} />;
      case "about":
        return <AboutPage navigate={navigate} />;
      case "match-history":
        return <MatchHistoryPage navigate={navigate} />;
      case "game-bot":
        return <GameVsBot navigate={navigate} difficulty={pageData} />;
      case "game-player":
        return <GameVsPlayer navigate={navigate} data={pageData} />;
      case "rank":
        return <RankPage navigate={navigate} />;
      case "game-review":
        return <GameReview navigate={navigate} gameId={pageData} />;
      default:
        return <LobbyPage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header navigate={navigate} />
      <main className="main-content">{renderPage()}</main>
      <Footer />

      {/* MODAL DE SAÍDA GLOBAL */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="game-over-card">
            
            {/* Botão X para fechar */}
            <button
              className="modal-close-btn"
              onClick={handleCancelExit}
              title="Cancelar"
            >
              <X size={24} />
            </button>

            {/* Ícone de Alerta */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={48} color="#ef4444" />
            </div>

            <h2>Partida em Andamento</h2>
            <p>
              Você está atualmente em uma partida. Se sair agora, você
              automaticamente <strong>abandonará o jogo</strong> (desistência).
            </p>

            <div className="modal-actions">
              {/* Botão de Ação Principal (Perigo/Abandonar) */}
              <button
                className="modal-btn btn-primary"
                onClick={handleConfirmExit}
              >
                <LogOut size={18} /> Abandonar e Sair
              </button>

              {/* Botão de Cancelar (Secundário) */}
              <button
                className="modal-btn btn-secondary"
                onClick={handleCancelExit}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Router;