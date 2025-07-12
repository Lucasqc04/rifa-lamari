import { Toaster } from "react-hot-toast";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import Dashboard from "./components/dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminAuthProvider } from "./components/AdminAuthContext";
import RaffleGrid from "./components/RaffleGrid";
//import NotificationPermission from "./components/NotificationPermission"; // Importa aqui

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />

          <Header />
          <Routes>
            <Route path="/" element={<><Hero /><RaffleGrid /></>} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/painel" element={<AdminPanel />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
