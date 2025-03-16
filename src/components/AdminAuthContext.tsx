import React, { createContext, useState, useEffect } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar o estado de autenticação do localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
