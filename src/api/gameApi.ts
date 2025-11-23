import { api } from "./client";
import type { Game } from "../types/game";


export class GameApi {
  
  async matchHistory() {
    return await api.get<Game[]>("/game/match/history");
  }

  async getGame(gameId: string) {
    return await api.get<Game>("/game", gameId)
  }

}