import { api } from "./client";
import type { Game, GameHistory } from "../types/game";


export class GameApi {
  
  async matchHistory(limit: number = 64, offset: number = 0) {
    return await api.get<GameHistory[]>("/game/match/history", { limit, offset });
  }

  async getGame(gameId: string) {
    return await api.get<Game>("/game", gameId)
  }

  async getGameHistory(gameId: string) {
    return await api.get<GameHistory>("/game/match/history/one", { gameId: gameId })
  }

  async getGlobalGameHistory(limit: number = 64, offset: number = 0) {
    return await api.get<GameHistory[]>("/game/match/history/global", { limit, offset })
  }

}