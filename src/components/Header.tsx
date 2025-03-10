import React from 'react';
import { Gift } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary-100 py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-primary-800">Rifa Lamari</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-primary-700">Cesta de Páscoa</p>
          <p className="text-xs text-primary-600">Apoie o sonho Lamari</p>
        </div>
      </div>
    </header>
  );
};
