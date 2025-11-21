import React, { useState, useEffect, useRef } from "react";
import { Send, User, Circle, Users } from "lucide-react";
import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import './GlobalChat.css'


interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  online: boolean;
}

interface GlobalChatProps {
  navigate: (page: PageType, data?: any) => void;
}

const GlobalChatPage = ({ navigate }: GlobalChatProps) => {

    const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) { connectWebSocket() }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const newUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    setUserId(newUserId);
    
    const ws = new WebSocket("ws://localhost:8081/chat");

    ws.onopen = () => {
      console.log("WebSocket conectado");
      setIsConnected(true);
      // Envia mensagem de entrada do usuário
      ws.send(
        JSON.stringify({
          type: "join",
          userId: newUserId,
          username: user!.username,
          timestamp: Date.now(),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensagem recebida:", data);

        switch (data.type) {
          case "message":
            const newMessage: Message = {
              id: data.id || `msg_${Date.now()}`,
              userId: data.userId,
              username: data.username,
              text: data.text,
              timestamp: data.timestamp,
            };
            setMessages((prev) => [...prev, newMessage]);
            break;
          case "user_joined":
            const joinMessage: Message = {
              id: `msg_${Date.now()}`,
              userId: "system",
              username: "Sistema",
              text: `${data.username} entrou no chat!`,
              timestamp: data.timestamp,
            };
            setMessages((prev) => [...prev, joinMessage]);
            break;
          case "user_left":
            const leaveMessage: Message = {
              id: `msg_${Date.now()}`,
              userId: "system",
              username: "Sistema",
              text: `${data.username} saiu do chat.`,
              timestamp: data.timestamp,
            };
            setMessages((prev) => [...prev, leaveMessage]);
            break;
          case "users_list":
            setOnlineUsers(data.users);
            break;
          case "history":
            setMessages(data.messages);
            break;
        }
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado");
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !wsRef.current) return;

    const messageData = {
      type: "message",
      text: inputText,
      userId,
      username: user!.username,
      timestamp: Date.now(),
    };

    wsRef.current.send(JSON.stringify(messageData));
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
            Online Users ({onlineUsers.filter((u) => u.online).length})
          </h2>
        </div>

        <div className="userList">
          {onlineUsers.map((user) => (
            <div key={user.id} className="userItem">
              <div className="userAvatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="userInfo">
                <div className="userName">
                  {user.username}
                  {user.id === userId && " (you)"}
                </div>
                <div className="userStatus">
                  <Circle
                    size={8}
                    fill={user.online ? "#10B981" : "#9CA3AF"}
                    color={user.online ? "#10B981" : "#9CA3AF"}
                  />
                  <span className="userStatusText">
                    {user.online ? "Online" : "Offline"}
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
            <h1 className="chatTitle">Chat Geral</h1>
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
            const isOwnMessage = msg.userId === userId;
            const isSystemMessage = msg.userId === "system";

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="systemMessageWrapper">
                  <div className="systemMessage">{msg.text}</div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`messageWrapper ${isOwnMessage ? 'messageWrapperOwn': ''}`}>
                <div className="messageAvatar">
                  {msg.username.charAt(0).toUpperCase()}
                </div>

                <div className="messageContent">
                  <div className="messageHeader">
                    <span className="messageSender">{msg.username}</span>
                    <span className="messageTime">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`messageBubble ${isOwnMessage ? "messageBubbleOwn" : "messageBubbleOther"}`}
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
              className={`sendButton ${inputText.trim() ? '' : 'sendButtonDisabled'}`}
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
}


export default GlobalChatPage;