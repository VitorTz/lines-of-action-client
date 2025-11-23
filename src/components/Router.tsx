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


const Router = () => {

  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageType>("lobby");
  const [pageData, setPageData] = useState<any>(null);

  const pageFromHash = (hash: string): {page: PageType, data?: any} => {
    if (!hash) return { page: "home" as PageType, data: null };
    const clean: string | PageType = hash.replace(/^#/, "");

    if (clean.startsWith("game-bot")) {
      const difficulty =  clean.split("-")[2]
      return { page: 'game-bot', data: difficulty }
    } else if (clean.startsWith("game-player")) {
      const t = clean.split("-")
      return { page: 'game-player', data: {gameId: t[2], color: t[3]} }
    }

    if (clean === "account") return { page: "account", data: null };
    if (clean === "login") return { page: "login", data: null };
    if (clean === "signup") return { page: "signup", data: null };
    if (clean === "match-history") return { page: "match-history", data: null };
    if (clean === "about") return { page: "about", data: null}
    if (clean === "global-chat") return { page: "global-chat", data: null }
    if (clean == "rank") return { page: "rank", data: null }
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

  const navigate = (page: PageType, data: any = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
    
    let hash = `#${page}`;

    if (page === 'game-bot') {
      hash = `#game-bot-${data}`;
    }
    else if (page === 'game-player') {
      hash = `#game-player-${data.gameId}-${data.color}`;
    }
    
    window.history.pushState(
      { page, data },
      "",
      `${window.location.pathname}${hash}`
    );
  };

  
  const renderPage = () => {
    if (!user && ![
        "signup", 
        "login", 
        "project-description", 
        "about",
        "rank"
      ].includes(currentPage)) {
      return <LoginPage navigate={navigate} /> 
    }
    switch (currentPage) {
      case "account":
        return <AccountPage navigate={navigate} />;
      case "global-chat":
        return <GlobalChatPage navigate={navigate} />
      case "lobby":
        return <LobbyPage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} />;
      case "signup":
        return <SignupPage navigate={navigate} />;
      case "project-description":
        return <ProjectDescriptionPage navigate={navigate} />
      case "about":
        return <AboutPage navigate={navigate} />
      case 'match-history':
        return <MatchHistoryPage navigate={navigate} />
      case 'game-bot':
        return <GameVsBot navigate={navigate} difficulty={pageData} />
      case "game-player":
        return <GameVsPlayer navigate={navigate} data={pageData} />
      case 'rank':
        return <RankPage navigate={navigate}/>
      default:
        return <LobbyPage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header navigate={navigate} />
      <main className="main-content">{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default Router;
