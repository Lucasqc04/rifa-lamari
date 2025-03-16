import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminAuthContext } from "./AdminAuthContext";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useContext(AdminAuthContext);

  // Verificar o estado de autenticação do localStorage
  const isAuthenticatedFromStorage = localStorage.getItem("isAuthenticated") === "true";

  return isAuthenticated || isAuthenticatedFromStorage ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
