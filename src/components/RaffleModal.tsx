import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

interface RaffleModalProps {
  participants: { name: string; slotNumber: number }[];
  onClose: () => void;
}

const RaffleModal: React.FC<RaffleModalProps> = ({ participants, onClose }) => {
  const [countdown, setCountdown] = useState(10);
  const [circleProgress, setCircleProgress] = useState(0); // Representa o progresso do círculo (0 a 100)
  const [winner, setWinner] = useState<{ name: string; slotNumber: number } | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCircleProgress((prev) => {
          if (prev >= 100) {
            setCountdown((prevCountdown) => prevCountdown - 1);
            return 0; // Reinicia o círculo para o próximo número
          }
          return prev + 10; // Incrementa o progresso do círculo
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (!winner) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[randomIndex]);
    }
  }, [countdown, participants, winner]);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      {!winner ? (
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">Sorteio em andamento...</h2>
          <div className="relative w-40 h-40">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e5e5"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#4caf50"
                strokeWidth="10"
                fill="none"
                strokeDasharray="282.6"
                strokeDashoffset={(282.6 * circleProgress) / 100}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <Confetti />
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-bold text-green-500 mb-4">Parabéns ao vencedor!</h2>
            <motion.div
              className="text-7xl font-bold text-white mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {winner.name}
            </motion.div>
            <motion.div
              className="text-4xl text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Número sorteado: {winner.slotNumber}
            </motion.div>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xl"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default RaffleModal;
