import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RaffleGrid } from './components/RaffleGrid';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Header />
        <Routes>
          <Route path="/" element={<><Hero /><RaffleGrid /></>} />
          <Route path="/painel" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
