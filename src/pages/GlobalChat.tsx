import React, { useState, useEffect, useRef } from "react";
import { Send, Users, Circle, Menu, X, MessageSquare } from "lucide-react";
import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import "./GlobalChat.css";
import {
  type GlobalChatMessage,
  useGlobalChat,
} from "../context/GlobalChatContext";
import { useSocket } from "../socket/useSocket";

interface User {
  id: string; // Socket ID
  userId: string;
  username: string;
  online: boolean;
  avatarUrl: string | null;
}

interface GlobalChatProps {
  navigate: (page: PageType, data?: any) => void;
}

const GlobalChatPage = ({ navigate }: GlobalChatProps) => {
  const { user } = useAuth();
  const { messages, addMessage } = useGlobalChat();
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = useSocket();
  const isConnected = socket.connected;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    socket.emit("join-global-chat", {
      userId: user.id,
      username: user.username,
      avatarUrl: user.perfilImageUrl,
    });

    socket.on("global-chat-message", (data: GlobalChatMessage) => {
      addMessage(data);
    });

    socket.on("global-chat-users-list", (data: { users: User[] }) => {
      setOnlineUsers(data.users);
    });

    return () => {
      socket.off("global-chat-message");
      socket.off("global-chat-users-list");
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return;

    const messageData = {
      text: inputText,
      userId: user.id,
      username: user.username,
      timestamp: Date.now(),
      avatarUrl: user.perfilImageUrl,
    };

    socket.emit("send-global-chat-message", messageData);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="global-chat-layout">
      <div className="chat-main-area">
        {/* Header */}
        <div className="chat-header-card">
          <div className="header-left">
            <div className="icon-wrapper">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="chat-title">Chat Global</h1>
              <div className="connection-badge">
                <Circle
                  size={8}
                  fill={isConnected ? "#10B981" : "#EF4444"}
                  color={isConnected ? "#10B981" : "#EF4444"}
                />
                <span>{isConnected ? "Conectado" : "Offline"}</span>
              </div>
            </div>
          </div>

          {/* Botão Mobile para abrir usuários */}
          <button
            className="mobile-users-toggle"
            onClick={() => setShowMobileSidebar(true)}
          >
            <Users size={20} />
            <span className="online-count-badge">{onlineUsers.length}</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="messages-card">
          <div className="messages-scroll-area">
            {messages.map((msg) => {
              const isOwnMessage = msg.userId === user?.id;
              const isSystemMessage = msg.userId === "system";

              if (isSystemMessage) {
                return (
                  <div key={msg.id} className="system-message">
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`message-row ${
                    isOwnMessage ? "message-own" : "message-other"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="message-avatar">
                      {msg.avatarUrl ? (
                        <img src={msg.avatarUrl} alt={msg.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="message-bubble-group">
                    {!isOwnMessage && (
                      <span className="message-sender-name">
                        {msg.username}
                      </span>
                    )}

                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="send-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`users-sidebar ${showMobileSidebar ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h3>
            <Users size={18} />
            Online ({onlineUsers.length})
          </h3>

          <button
            className="close-sidebar-btn"
            onClick={() => setShowMobileSidebar(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="users-list">
          {onlineUsers.map((u) => (
            <div key={u.id} className="user-item">
              <div className="user-avatar-small">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.username} />
                ) : (
                  <span>{u.username.charAt(0).toUpperCase()}</span>
                )}
                <div
                  className={`status-dot ${u.online ? "online" : "offline"}`}
                />
              </div>

              <div className="user-info">
                <span className="u-name">
                  {u.username} {u.userId === user?.id && "(Você)"}
                </span>
                <span className="u-status">
                  {u.online ? "Online" : "Ausente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showMobileSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
    </div>
  );
};

export default GlobalChatPage;
