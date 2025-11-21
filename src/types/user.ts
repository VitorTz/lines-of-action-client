

export interface Address {

  country: string
  state: string
  city: string

}

export interface User {

  username: string
  email: string
  perfilImageUrl?: string
  createdAt: string
  age: number
  address: Address
  rank: number
  
}


export interface UserCreate {

  username: string
  email: string

}


export interface SignupForm {

  username: string;
  email: string;
  password: string;
  age: number;
  address: Address;
  perfilImageFile?: File | null

}



export interface AuthContextType {

  user: User | null;
  loading: boolean
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (signupForm: SignupForm) => Promise<{ ok: boolean, error: any }>;
  logout: () => Promise<void>;

}

