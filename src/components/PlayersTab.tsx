import { useSocket } from "../socket/useSocket";
import { type PageType } from "../types/general";
import { useState, useEffect } from "react";


interface PlayersTabProps {
  navigate: (page: PageType, data?: any) => void;
}

// Apenas para mostrar como ficaria
// Os dados virão do websocket
const PlayersTab = ({ navigate }: PlayersTabProps) => {

  const socket = useSocket()
  const [numPlayersOnLobby, setNumPlayersOnLobby] = useState(0)

  useEffect(() => {
    socket.emit('num-players-on-lobby')

    socket.on('num-players-on-lobby', (num) => {
      console.log("num", num)
      setNumPlayersOnLobby(parseInt(num))
    })

  }, [])

  return (
    <>
        <p>Jogadores procurando partida: {numPlayersOnLobby}</p>
    </>
  )
};


export default PlayersTab;