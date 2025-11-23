import { api } from "./client";
import type { User } from "../types/user";


export interface UserRankQuery {
  sort?: "rank" | "age" | "createdAt";
  order?: "asc" | "desc";
  minRank?: number;
  maxRank?: number;
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
}


export interface UserRankResponse {
  count: number;
  items: User[];
}


export class MetricsApi {
  
  async getUserRank(params?: UserRankQuery) {
    return await api.get<UserRankResponse>("/metrics/users/rank", params);
  }

}
