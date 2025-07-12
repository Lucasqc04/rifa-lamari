import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroEndSection = document.querySelector(".hero-end");
      if (heroEndSection) {
        const rect = heroEndSection.getBoundingClientRect();
        const isBelowHeroEnd = rect.top <= window.innerHeight;
        setIsVisible(!isBelowHeroEnd);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-12 px-4 md:px-6 bg-gradient-to-b from-primary-50 to-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold text-primary-800 mb-4">
              A Visa Doces preparou uma rifa super especial pra vocês!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Além de concorrer a prêmios incríveis, você ainda nos ajuda a continuar adoçando a vida com muito amor e carinho!
            </p>
            <p className="text-lg text-gray-600 mb-6 font-bold">PRÊMIOS INCRÍVEIS:</p>
            <ul className="text-lg text-gray-600 mb-6 list-disc pl-5">
              <li>Barras de chocolates (Milka, Kit Kat, Cacau Show...)</li>
              <li>Doces gourmet da Visa Doces</li>
              <li>1 Perfume árabe original - Sabah Al Ward</li>
            </ul>
            <p className="text-lg text-gray-600 mb-6">
              <strong>VALOR DO NÚMERO:</strong> R$15,00
            </p>
            <p className="text-lg text-gray-600 mb-6">
              <strong>SORTEIO:</strong> Dia 29/07 ou assim que todos os números forem preenchidos
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Para participar, siga os passos abaixo:
            </p>
            <ol className="text-lg text-gray-600 mb-6 list-decimal pl-5">
              <li>Selecione um número disponível abaixo.</li>
              <li>Adicione seu nome e número de telefone para contato.</li>
              <li>Escaneie ou copie o código Pix exibido no modal e pague R$15,00.</li>
            </ol>
            <p className="text-lg text-gray-600 mb-6">
              Após o pagamento, sua reserva será confirmada e você estará concorrendo aos prêmios incríveis!
            </p>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
            <img
              src="src/images/Design sem nome (4).png"
              alt="Cesta de Páscoa"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
      {/* Botão fixo de scroll para baixo com animação de pulsar e centralizado horizontalmente */}
      {isVisible && (
        <motion.div
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-primary-600 cursor-pointer md:hidden flex items-center justify-center"
          onClick={() => {
            const heroEndSection = document.querySelector(".hero-end");
            heroEndSection?.scrollIntoView({ behavior: "smooth" });
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ left: "30%", transform: "translateX(-50%)" }}
        >
          ↓ escolha seu número!
        </motion.div>
      )}
      {/* Marcador para o final da seção Hero */}
      <div className="hero-end mt-12"></div>
    </section>
  );
};
