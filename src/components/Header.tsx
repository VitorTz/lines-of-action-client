import {
  User,
  Menu,
  X,
  History,
  Info,
  ChartArea,
  MessageCircle,
  Trophy,
} from "lucide-react";
import type { PageType } from "../types/general";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth/AuthContext";
import "./Header.css";

interface HeaderProps {
  navigate: (page: PageType, data?: any) => void;
}

const Header = ({ navigate }: HeaderProps) => {
  const { user } = useAuth();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const hamburgerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setHamburgerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate("lobby")}>
          <span>Lines of Action</span>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <div className="hamburger-menu" ref={hamburgerRef}>
            <button
              className="hamburger-button"
              onClick={() => setHamburgerOpen(!hamburgerOpen)}
            >
              {hamburgerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div
              className={`hamburger-dropdown ${hamburgerOpen ? "open" : ""}`}
            >
              {user ? (
                <div className="user-menu" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      navigate("account");
                      setHamburgerOpen(false);
                    }}
                  >
                    <User size={18} /> {user.username}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("login");
                    setHamburgerOpen(false);
                  }}
                >
                  <User size={18} />
                  Login
                </button>
              )}
              {
                user &&
                <button
                  onClick={() => {
                    navigate("global-chat");
                    setHamburgerOpen(false);
                  }}
                >
                  <MessageCircle size={18} /> Global Chat
                </button>
              }
              {
                user &&
                <button
                  onClick={() => {
                    navigate("match-history");
                    setHamburgerOpen(false);
                  }}
                >
                  <History size={18} /> Match History
                </button>
              }

              <button
                onClick={() => {
                  navigate("rank");
                  setHamburgerOpen(false);
                }}
              >
                <Trophy size={18} /> Rank
              </button>

              <button
                onClick={() => {
                  navigate("project-description");
                  setHamburgerOpen(false);
                }}
              >
                <Info size={18} /> Project
              </button>
              <button
                onClick={() => {
                  navigate("about");
                  setHamburgerOpen(false);
                }}
              >
                <Info size={18} /> Game
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
