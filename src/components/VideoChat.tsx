import { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/useSocket";
import { Video, Mic, MicOff, VideoOff } from "lucide-react";
import "./VideoChat.css";

interface VideoChatProps {
  gameId: string;
  myColor: string; // Pode vir como 'black' ou 'white'
}

const VideoChat = ({ gameId, myColor }: VideoChatProps) => {
  const socket = useSocket();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    "Iniciando câmera..."
  );

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
  };

  useEffect(() => {
    let mounted = true;

    const startChat = async () => {
      try {
        console.log("[VideoChat] Solicitando permissão de mídia...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setConnectionStatus("Aguardando oponente...");

        // Cria a conexão
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnection.current = pc;

        // Adiciona faixas locais
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Listener: Quando receber vídeo remoto
        pc.ontrack = (event) => {
          console.log("[VideoChat] Stream remoto recebido!");
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionStatus(""); // Limpa status para mostrar o vídeo
          }
        };

        // Listener: Mudança de estado da conexão
        pc.oniceconnectionstatechange = () => {
          console.log("[VideoChat] Estado da conexão:", pc.iceConnectionState);
          if (pc.iceConnectionState === "disconnected") {
            setConnectionStatus("Oponente desconectou");
          }
          if (pc.iceConnectionState === "connected") {
            setConnectionStatus("");
          }
        };

        // Listener: Candidatos ICE (Rotas de rede)
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("video-signal", {
              gameId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        // Quem começa (Pretas) cria a oferta
        if (myColor === "black") {
          console.log("[VideoChat] Sou Player 1 (Black), criando oferta...");
          pc.onnegotiationneeded = async () => {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("video-signal", {
                gameId,
                signal: { type: "offer", sdp: pc.localDescription },
              });
            } catch (err) {
              console.error("[VideoChat] Erro na negociação:", err);
            }
          };
        }
      } catch (err) {
        console.error("[VideoChat] Erro ao acessar câmera:", err);
        setConnectionStatus("Sem permissão de câmera");
      }
    };

    startChat();

    // Função auxiliar para processar fila
    const processCandidateQueue = async (pc: RTCPeerConnection) => {
      if (iceCandidatesQueue.current.length > 0) {
        console.log(
          `[VideoChat] Processando ${iceCandidatesQueue.current.length} candidatos da fila.`
        );
        for (const candidate of iceCandidatesQueue.current) {
          await pc.addIceCandidate(candidate);
        }
        iceCandidatesQueue.current = [];
      }
    };

    // Processar sinais recebidos do Socket
    const handleSignal = async (data: any) => {
      const pc = peerConnection.current;
      if (!pc) return;

      const { signal } = data;
      console.log("[VideoChat] Sinal recebido:", signal.type);

      try {
        if (signal.type === "offer") {
          // Recebeu oferta -> Configura remoto -> Cria resposta
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Processa fila de candidatos que chegaram antes
          processCandidateQueue(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("video-signal", {
            gameId,
            signal: { type: "answer", sdp: pc.localDescription },
          });
        } else if (signal.type === "answer") {
          // Recebeu resposta -> Configura remoto
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          processCandidateQueue(pc);
        } else if (signal.type === "candidate") {
          // Recebeu candidato ICE
          const candidate = new RTCIceCandidate(signal.candidate);
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(candidate);
          } else {
            // Se a descrição remota ainda não chegou, guarda na fila
            console.log("[VideoChat] Guardando candidato na fila...");
            iceCandidatesQueue.current.push(candidate);
          }
        }
      } catch (err) {
        console.error("[VideoChat] Erro WebRTC:", err);
      }
    };

    socket.on("video-signal", handleSignal);

    return () => {
      mounted = false;
      socket.off("video-signal", handleSignal);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [gameId, myColor, socket]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="video-chat-container">
      <div className="remote-video-wrapper">
        {/* Mostra o vídeo do oponente */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remote-video"
        />

        {/* Mensagem de status (some quando conecta) */}
        {connectionStatus && (
          <span className="video-status">{connectionStatus}</span>
        )}

        {/* Controles flutuantes sobre o vídeo do oponente */}
        <div className="video-controls-overlay">
          <button
            onClick={toggleMute}
            className={`control-btn ${isMuted ? "off" : ""}`}
            title="Mutar microfone"
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`control-btn ${isVideoOff ? "off" : ""}`}
            title="Desligar câmera"
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
