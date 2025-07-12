// src/components/RaffleGrid.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import type { RaffleEntry, RaffleSlot } from '../types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import ReservationFormModal from './ReservationFormModal';
import ConfirmRegistrationModal from './ConfirmRegistrationModal';
import PaymentModal from './PaymentModal';
import CancelPixModal from './CancelPixModal';
import RemoveReservationModal from './RemoveReservationModal';
import FloatingWhatsappButton from './FloatingWhatsappButton';

const PIX = {
  PAYLOAD: "00020126410014BR.GOV.BCB.PIX0119visadoces@gmail.com520400005303986540515.005802BR5901N6001C62070503***63043F15",
  PRICE: 15,
  TOTAL_SLOTS: 100,
};

interface FormData {
  name: string;
  whatsapp: string;
}

const RaffleGrid: React.FC = () => {
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', whatsapp: '' });
  const [removeFormData, setRemoveFormData] = useState<FormData>({ name: '', whatsapp: '' });
  
  // Flags para controle dos modais
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelPixModal, setShowCancelPixModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [slotToRemove, setSlotToRemove] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      const initialSlots: RaffleSlot[] = Array.from({ length: PIX.TOTAL_SLOTS }, (_, i) => ({
        number: i + 1,
        taken: false,
      }));

      const q = query(collection(db, 'entries'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedSlots: RaffleSlot[] = [...initialSlots];
        snapshot.docs.forEach((doc) => {
          const entry = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as RaffleEntry;

          updatedSlots[entry.slotNumber - 1] = {
            ...updatedSlots[entry.slotNumber - 1],
            taken: true,
            entry,
          };
        });
        setSlots(updatedSlots);
        setInitialLoading(false);
      });

      return unsubscribe;
    };

    loadSlots();
  }, []);

  const handleSlotClick = async (slotNumber: number) => {
    const q = query(
      collection(db, 'entries'),
      where('slotNumber', '==', slotNumber)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast.error('Este número já está reservado!');
      return;
    }
    setSelectedSlot(slotNumber);
    setFormData({ name: '', whatsapp: '' });
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || submitting) return;

    const q = query(
      collection(db, 'entries'),
      where('slotNumber', '==', selectedSlot)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast.error('Este número já foi reservado por outra pessoa!');
      setShowReservationModal(false);
      return;
    }
    setShowReservationModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      setSubmitting(true);
      const entry: Omit<RaffleEntry, 'id'> = {
        name: formData.name,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        slotNumber: selectedSlot as number,
        paid: false,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'entries'), entry);
      setShowConfirmModal(false);
      setShowPaymentModal(true);
      toast.success('Número reservado com sucesso! Faça o pagamento para confirmar.');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Erro ao reservar o número. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(PIX.PAYLOAD);
    toast.success('Código PIX copiado!');
  };

  const handleSlotRemove = (slot: RaffleSlot) => {
    if (slot.entry?.paid) {
      toast.error('Este número já foi pago e não pode ser removido!');
      return;
    }
    setSlotToRemove(slot.number);
    setRemoveFormData({ name: '', whatsapp: '' });
    setShowCancelPixModal(true);
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotToRemove || submitting) return;

    const slot = slots.find((s) => s.number === slotToRemove);
    if (!slot || !slot.entry) {
      toast.error('Reserva não encontrada.');
      return;
    }

    if (
      removeFormData.name !== slot.entry.name ||
      removeFormData.whatsapp.replace(/\D/g, '') !== slot.entry.whatsapp
    ) {
      toast.error('Os dados informados não correspondem aos cadastrados.');
      return;
    }

    try {
      setSubmitting(true);
      await deleteDoc(doc(db, 'entries', slot.entry.id));
      toast.success('Reserva removida com sucesso.');
      setShowRemoveModal(false);
    } catch (error) {
      console.error('Error removing entry:', error);
      toast.error('Erro ao remover a reserva. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-800 mb-2">Escolha seu número da sorte</h2>
        <p className="text-gray-600">Cada número custa apenas R$ {PIX.PRICE},00</p>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
        {slots.map((slot) => (
          <motion.button
            key={slot.number}
            onClick={() => {
              if (!slot.taken) {
                handleSlotClick(slot.number);
              } else if (!slot.entry?.paid) {
                handleSlotRemove(slot);
              }
            }}
            disabled={slot.taken && slot.entry?.paid}
            className={clsx(
              'aspect-square rounded-full text-sm font-medium transition-all p-1',
              'flex flex-col items-center justify-center',
              slot.taken
                ? slot.entry?.paid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                : 'bg-[#905010] text-white'
            )}
            whileHover={{ scale: 1.05, boxShadow: '0px 5px 15px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg font-bold">{slot.number}</span>
            {slot.taken && (
              <>
                <span className="text-[10px] leading-tight text-center">
                  {slot.entry?.name.split(' ')[0]}
                </span>
                {slot.entry?.paid && (
                  <Check className="w-3 h-3 text-green-600 mt-1" />
                )}
              </>
            )}
          </motion.button>
        ))}
      </div>

      {/* Seção de legendas */}
      <div className="flex gap-4 justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-primary-200 rounded"></div>
          <span className="text-sm">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-sm">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-sm">Pago</span>
        </div>
      </div>

      {/* Modais */}
      {showReservationModal && selectedSlot && (
        <ReservationFormModal
          selectedSlot={selectedSlot}
          formData={formData}
          onChange={(field, value) => setFormData({ ...formData, [field]: value })}
          onCancel={() => setShowReservationModal(false)}
          onSubmit={handleReservationSubmit}
          submitting={submitting}
        />
      )}

      {showConfirmModal && selectedSlot && (
        <ConfirmRegistrationModal
          selectedSlot={selectedSlot}
          formData={formData}
          onCancel={() => {
            setShowConfirmModal(false);
            setShowReservationModal(true);
          }}
          onConfirm={handleConfirmRegistration}
          submitting={submitting}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          pix={PIX}
          onCopy={copyPixCode}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showCancelPixModal && (
        <CancelPixModal
          pix={PIX}
          onCopy={copyPixCode}
          onProceed={() => {
            setShowCancelPixModal(false);
            setShowRemoveModal(true);
          }}
          onClose={() => setShowCancelPixModal(false)}
        />
      )}

      {showRemoveModal && slotToRemove && (
        <RemoveReservationModal
          slotNumber={slotToRemove}
          removeFormData={removeFormData}
          onChange={(field, value) => setRemoveFormData({ ...removeFormData, [field]: value })}
          onCancel={() => setShowRemoveModal(false)}
          onSubmit={handleRemoveSubmit}
          submitting={submitting}
        />
      )}

      <FloatingWhatsappButton />
    </div>
  );
};

export default RaffleGrid;
