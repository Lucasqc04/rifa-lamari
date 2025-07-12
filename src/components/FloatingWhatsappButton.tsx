import React from 'react';
import { FaWhatsapp } from "react-icons/fa";

const FloatingWhatsappButton: React.FC = () => {
  const handleClick = () => {
    // Altere o número e a mensagem conforme necessário
    window.open('https://wa.me/5511986929495?text=Olá,%20preciso%20de%20ajuda!', '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 flex items-center space-x-2 z-50">
      <div className="bg-white text-green-700 px-3 py-2 rounded-full shadow-md">
        Dúvidas? Entre em contato!
      </div>
      <button
        onClick={handleClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
        aria-label="Contato via WhatsApp"
      >
        <FaWhatsapp  className="w-8 h-8" />
      </button>
    </div>
  );
};

export default FloatingWhatsappButton;
