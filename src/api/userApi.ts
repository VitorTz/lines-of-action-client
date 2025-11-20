import { api } from "./client";
import type { User, Address } from "../types/user";


export class UserAPI {
    
  async updateProfile(data: { username: string; age: number, address: Address }) {
    return await api.put<User>("/auth/user/", data);
  }

  async updateProfileImageUrl(perfilImageUrl: string): Promise<User> {
    return await api.put("/auth/user/profile/image", { perfilImageUrl });
  }

}
