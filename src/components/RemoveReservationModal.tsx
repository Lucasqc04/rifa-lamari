import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemoveReservationModalProps {
  slotNumber: number;
  removeFormData: { name: string; whatsapp: string };
  onChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const RemoveReservationModal: React.FC<RemoveReservationModalProps> = ({
  slotNumber,
  removeFormData,
  onChange,
  onCancel,
  onSubmit,
  submitting,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 max-w-md w-full"
          role="dialog"
          aria-modal="true"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-primary-800 mb-4">
            Remover reserva do número {slotNumber}
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Para confirmar a remoção, insira o mesmo Nome e WhatsApp usados no cadastro.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="remove-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                id="remove-name"
                required
                value={removeFormData.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="remove-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                id="remove-whatsapp"
                required
                placeholder="(11) 99999-9999"
                value={removeFormData.whatsapp}
                onChange={(e) => onChange('whatsapp', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RemoveReservationModal;
