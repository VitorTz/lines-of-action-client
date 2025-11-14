


export interface User {

    username: string
    email: string
    perfil_image_url?: string
    createdAt: string

}

export interface AuthContextType {
    
  user: User | null;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

}