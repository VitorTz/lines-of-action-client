import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { useSocket } from "../socket/useSocket";
import { useAuth } from "./auth/AuthContext";
import "./LobbyChat.css";

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  avatarUrl?: string;
  type: 'message' | 'system';
}

const LobbyChat = () => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Gerencia conexão com a sala
  useEffect(() => {
    if (isConnected && user) {
      // Envia avatar também no join, caso o backend queira registrar
      socket.emit("join-lobby-chat", { 
        username: user.username,
        avatarUrl: user.perfilImageUrl 
      });

      const handleMsg = (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);
      };

      socket.on("lobby-chat-message", handleMsg);

      return () => {
        socket.off("lobby-chat-message", handleMsg);
        socket.emit("leave-lobby-chat");
      };
    }
  }, [isConnected, user, socket]);

  const handleToggleChat = () => {
    if (!isConnected) {
      setIsConnected(true);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsOpen(false);
    setMessages([]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    socket.emit("send-lobby-message", {
      text: inputText,
      username: user.username,
      userId: user.id,
      avatarUrl: user.perfilImageUrl // Garante que o avatar vai na mensagem
    });
    setInputText("");
  };

  if (!isConnected) {
    return (
      <button onClick={handleToggleChat} className="btn-join-chat">
        <MessageSquare size={18} />
        Entrar no Chat da Fila
      </button>
    );
  }

  return (
    <div className={`lobby-chat-container ${isOpen ? 'open' : 'minimized'}`}>
      <div className="lobby-chat-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-title">
          <MessageSquare size={16} />
          <span>Chat da Fila</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}
            title="Sair do chat"
          >
            <X size={16} />
          </button>
          <button className="icon-btn">
            {isOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lobby-chat-body">
          <div className="messages-list">
            {messages.length === 0 && (
              <p className="empty-chat-msg">Bem-vindo ao chat da fila.</p>
            )}
            {messages.map((msg) => {              
              const isOwnMessage = user?.username === msg.username;

              return (
                <div 
                  key={msg.id} 
                  className={`chat-msg-item ${isOwnMessage ? 'own-message' : ''}`}
                >
                  {/* Avatar */}
                  <div className="msg-avatar-container">
                    {msg.avatarUrl ? (
                      <img 
                        src={msg.avatarUrl} 
                        alt={msg.username} 
                        className="msg-avatar-img"
                      />
                    ) : (
                      <div className="msg-avatar-fallback">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="msg-content-wrapper">
                    <span className="msg-user">
                      {isOwnMessage ? 'Você' : msg.username}:
                    </span>
                    <span className="msg-text">{msg.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mensagem..."
            />
            <button type="submit" disabled={!inputText.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LobbyChat;