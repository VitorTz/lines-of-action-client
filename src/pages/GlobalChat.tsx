import React, { useState, useEffect, useRef } from "react";
import { Send, Users, Circle } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = useSocket();

  const isConnected = true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.emit("join-global-chat", {
      userId: user!.id || `user_${Date.now()}`,
      username: user!.username,
      avatarUrl: user?.perfilImageUrl,
    });

    // Escuta mensagens recebidas
    socket.on("global-chat-message", (data: GlobalChatMessage) => {
      addMessage(data);
    });

    // Escuta atualização da lista de usuários
    socket.on("global-chat-users-list", (data: { users: User[] }) => {
      setOnlineUsers(data.users);
    });

    return () => {
      socket.off("global-chat-message");
      socket.off("global-chat-users-list");
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const messageData = {
      text: inputText,
      userId: user!.id || "unknown",
      username: user!.username,
      timestamp: Date.now(),
      avatarUrl: user?.perfilImageUrl,
    };

    // Emite o evento para o backend
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
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chatContainer">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebarHeader">
          <h2 className="sidebarTitle">
            <Users size={20} style={{ marginRight: "8px" }} />
            Online ({onlineUsers.length})
          </h2>
        </div>

        <div className="userList">
          {onlineUsers.map((u) => (
            <div key={u.id} className="userItem">
              {u.avatarUrl ? (
                <img
                  src={u.avatarUrl}
                  width={32}
                  height={32}
                  style={{ borderRadius: 32 }}
                  alt="avatar"
                />
              ) : (
                <div className="userAvatar">
                  {u.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="userInfo">
                <div className="userName">
                  {u.username}
                  {u.userId === user?.id && " (você)"}
                </div>
                <div className="userStatus">
                  <Circle
                    size={8}
                    fill={u.online ? "#10B981" : "#9CA3AF"}
                    color={u.online ? "#10B981" : "#9CA3AF"}
                  />
                  <span className="userStatusText">
                    {u.online ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="mainChat">
        {/* Header */}
        <div className="chatHeader">
          <div>
            <h1 className="chatTitle">Chat Global</h1>
            <p className="chatStatus">
              {isConnected ? "Conectado" : "Desconectado"}
            </p>
          </div>
          <div className="connectionStatus">
            <Circle
              size={12}
              fill={isConnected ? "#10B981" : "#EF4444"}
              color={isConnected ? "#10B981" : "#EF4444"}
            />
            <span className="connectionText">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="messagesContainer">
          {messages.map((msg) => {
            const isOwnMessage = msg.userId === user?.id;
            const isSystemMessage = msg.userId === "system";

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="systemMessageWrapper">
                  <div className="systemMessage">{msg.text}</div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`messageWrapper ${
                  isOwnMessage ? "messageWrapperOwn" : ""
                }`}
              >
                <div className="messageAvatar">
                  {msg.avatarUrl ? (
                    <img
                      src={msg.avatarUrl}
                      className="userAvatarImg"
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                  ) : (
                    msg.username.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="messageContent">
                  <div className="messageHeader">
                    <span className="messageSender">{msg.username}</span>
                    <span className="messageTime">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`messageBubble ${
                      isOwnMessage ? "messageBubbleOwn" : "messageBubbleOther"
                    }`}
                  >
                    <p className="messageText">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="inputContainer">
          <div className="inputWrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="textarea"
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={`sendButton ${
                inputText.trim() ? "" : "sendButtonDisabled"
              }`}
            >
              <Send size={20} />
            </button>
          </div>

          <p className="inputHint">
            Pressione Enter para enviar, Shift + Enter para quebrar linha
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalChatPage;
