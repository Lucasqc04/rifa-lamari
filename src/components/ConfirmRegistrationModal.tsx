import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmRegistrationModalProps {
  selectedSlot: number;
  formData: { name: string; whatsapp: string };
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const ConfirmRegistrationModal: React.FC<ConfirmRegistrationModalProps> = ({
  selectedSlot,
  formData,
  onConfirm,
  onCancel,
  submitting,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    modalRef.current?.focus();
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
          ref={modalRef}
          className="bg-white rounded-xl p-6 max-w-md w-full"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-primary-800 mb-4">
            Confirmar Dados para o número {selectedSlot}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Confira seus dados abaixo – sua sorte pode estar a um passo!
          </p>
          <ul className="mb-4">
            <li>
              <strong>Nome:</strong> {formData.name}
            </li>
            <li>
              <strong>WhatsApp:</strong> {formData.whatsapp}
            </li>
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmRegistrationModal;
