import { api } from "./client";
import type { Address, SignupForm, User } from "../types/user";


class AuthAPI {
  async me() {
    return await api.get<User>("/auth/me");
  }

  async login(email: string, password: string) {
    return await api.post<User>("/auth/login", { email, password });
  }

  async signup(signupForm: SignupForm) {
    return await api.post("/auth/signup", signupForm);
  }

  async refresh() {
    return await api.post<User>("/auth/refresh");
  }

  async logout() {
    return await api.post("/auth/logout");
  }

  async logoutAll() {
    return await api.post("/auth/logout/all");
  }  


}


class UserAPI {
  async updateProfile(data: { username: string; age: number, address: Address }) {
    return await api.put<User>("/auth/user/", data);
  }

  async updateProfileImage(file: File) {
    return await api.upload<{url: string}>("/auth/user/image/perfil", file);
  }

  async deleteProfileImage() {
    return await api.delete("/auth/user/image/perfil");
  }
}


class LinesApi {

  readonly auth = new AuthAPI();
  readonly user = new UserAPI();

}


export const linesApi = new LinesApi();