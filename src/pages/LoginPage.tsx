import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import { useState } from "react";
import "./AuthPage.css";
import { useNotification } from "../components/notification/NotificationContext";

interface LoginPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { addNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSuccess = () => {
    addNotification({
      type: "success",
      title: "Login realizado!",
      message: "Bem-vindo de volta",
      duration: 3000,
    });
  };

  const handleError = () => {
    addNotification({
      type: "error",
      title: "Erro",
      message: "Email ou senha inválidos",
      duration: 3000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);
    if (success) {
      handleSuccess();
      navigate("lobby");
    } else {
      handleError();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Login</button>
        </form>
        <p>
          Não tem conta? <a onClick={() => navigate("signup")}>Cadastrar</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
