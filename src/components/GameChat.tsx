import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/useSocket';
import { Send, MessageSquare } from 'lucide-react';
import './GameChat.css';

interface GameChatProps {
  gameId: string;
  playerId: string;
}

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}

const GameChat = ({ gameId, playerId }: GameChatProps) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  
  // Mudança 1: Referência para o container das mensagens, não para um elemento vazio no fim
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Mudança 2: Manipular o scrollTop diretamente. Isso não causa rolagem na página pai.
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  // Rolar quando as mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Rolar quando o componente monta (ex: ao trocar de aba)
  useEffect(() => {
    // Pequeno timeout para garantir que o layout renderizou antes de rolar
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    socket.on('game-chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('game-chat-message');
    };
  }, [socket]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    socket.emit('send-game-message', {
      gameId,
      playerId,
      message: inputText
    });

    setInputText("");
  };

  return (
    <div className="game-chat-container">
      <div className="game-chat-header">
        <MessageSquare size={18} />
        <span>Chat da Partida</span>
      </div>

      {/* Mudança 3: Adicionar a ref aqui no container com scroll */}
      <div className="game-chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="empty-chat">Envie uma mensagem...</div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === playerId;
          return (
            <div key={idx} className={`chat-bubble-wrapper ${isMe ? 'me' : 'opponent'}`}>
              <div className="chat-bubble">
                {msg.text}
              </div>
              <span className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      <form className="game-chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite aqui..."
        />
        <button type="submit">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default GameChat;