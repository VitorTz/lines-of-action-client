import { api } from "./client";
import type { Game, GameHistory } from "../types/game";


export class GameApi {
  
  async matchHistory() {
    return await api.get<GameHistory[]>("/game/match/history");
  }

  async getGame(gameId: string) {
    return await api.get<Game>("/game", gameId)
  }

  async getGameHistory(gameId: string) {
    return await api.get<GameHistory>("/game/match/history/one", { gameId: gameId })
  }

}