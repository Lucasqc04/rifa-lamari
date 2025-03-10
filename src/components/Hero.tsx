import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="py-12 px-4 md:px-6 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold text-primary-800 mb-4">
              Cesta de Páscoa Lamari
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Ajude a realizar o sonho das meninas Lara e Mariana de abrir sua própria loja de roupas!
              Cada número custa apenas R$8,00 e você concorre a uma incrível cesta de Páscoa.
            </p>
       
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1552767059-ce182ead6c1b"
              alt="Cesta de Páscoa"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
