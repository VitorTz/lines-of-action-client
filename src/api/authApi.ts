import { api } from "./client";
import type { User, SignupForm } from "../types/user";


export class AuthAPI {
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