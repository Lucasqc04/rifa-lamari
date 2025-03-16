import React, { useContext, useState } from "react";
import { AdminAuthContext } from "./AdminAuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { setIsAuthenticated } = useContext(AdminAuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const adminUsername = import.meta.env.VITE_USERNAME;
    const adminPassword = import.meta.env.VITE_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
      // Salvar autenticação no localStorage
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      navigate("/painel"); // Redireciona após login
    } else {
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Painel Administrativo</h2>
      <input
        type="text"
        placeholder="Username"
        className="border rounded p-2 mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-primary-500 text-white rounded p-2" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
