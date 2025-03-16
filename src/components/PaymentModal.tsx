import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';

interface PaymentModalProps {
  pix: { PAYLOAD: string; PRICE: number };
  onCopy: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ pix, onCopy, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    modalRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
          <h3 className="text-xl font-bold text-primary-800 mb-4">Pagamento via PIX</h3>
          <p className="text-sm text-gray-600 mb-4">
            Pague agora e garanta sua chance de ganhar! Assim que o pagamento for confirmado, seu número será validado.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary-50 p-4 rounded-lg w-full">
              <p className="text-sm text-primary-700 mb-4">
                Após realizar o pagamento, nossa equipe confirmará seu número.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center">
                <QRCodeSVG value={pix.PAYLOAD} size={200} />
              </div>
            </div>
            <div className="w-full p-4 bg-primary-50 rounded-lg">
              <p className="text-center font-medium text-primary-800 mb-2">
                Valor a pagar: <span className="text-xl">R$ {pix.PRICE},00</span>
              </p>
              <button
                onClick={onCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
              >
                <Copy size={20} />
                Copiar código PIX
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
