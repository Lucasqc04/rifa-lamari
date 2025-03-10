import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RaffleGrid } from './components/RaffleGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Header />
      <Hero />
      <RaffleGrid />
    </div>
  );
}

export default App;