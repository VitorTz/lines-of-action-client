import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type User, type SignupForm } from "../../types/user";
import { linesApi } from "../../api/linesApi";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    await linesApi.auth
      .me()
      .then((u) => setUser(u))
      .catch((err) => console.log(err));

    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return await linesApi.auth
      .login(email, password)
      .then((u) => {
        setUser(u); return true;
      })
      .catch((err) => {
        console.error("Login failed:", err);
        return false;
      });
  };

  const signup = async (signupForm: SignupForm): Promise<{ ok: boolean; error: any }> => {
    return await linesApi.auth
      .signup(signupForm)
      .then(() => ({ ok: true, error: null }))
      .catch((err) => {
        console.error("Signup failed:", err);
        return { ok: false, error: err };
      });
  };

  const logout = async () => {
    await linesApi.auth
      .logout()
      .then(() => setUser(null))
      .catch((err) => console.error("Logout failed:", err));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
