import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import type { RaffleEntry, RaffleSlot } from '../types';
import clsx from 'clsx';
import FloatingWhatsappButton from './FloatingWhatsappButton';

// Configuração do PIX
const PIX = {
  PAYLOAD: "00020101021126360014br.gov.bcb.pix0114+5511985077255520400005303986540510.005802BR5923LARA FERRARI DE ALMEIDA6009SAO PAULO62070503***63047A3D",
  PRICE: 10,
  TOTAL_SLOTS: 200,
};

interface FormData {
  name: string;
  whatsapp: string;
}

export const RaffleGrid: React.FC = () => {
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', whatsapp: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Novos estados para confirmação e remoção
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeFormData, setRemoveFormData] = useState({ name: '', whatsapp: '' });
  const [slotToRemove, setSlotToRemove] = useState<number | null>(null);
  const [showCancelPixModal, setShowCancelPixModal] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      const initialSlots: RaffleSlot[] = Array.from({ length: PIX.TOTAL_SLOTS }, (_, i) => ({
        number: i + 1,
        taken: false,
      }));

      const q = query(collection(db, 'entries'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedSlots: RaffleSlot[] = [...initialSlots];
        let paidCount = 0;

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

          if (entry.paid) {
            paidCount++;
          }
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
    setShowForm(true);
    setShowPayment(false);
    setFormData({ name: '', whatsapp: '' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || submitting) return;

    // Verifica se o número já foi reservado antes de prosseguir
    const q = query(
      collection(db, 'entries'),
      where('slotNumber', '==', selectedSlot)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.error('Este número já foi reservado por outra pessoa!');
      setShowForm(false);
      return;
    }

    // Ao invés de confirmar imediatamente, exibe o modal para confirmar os dados
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
      setShowForm(false);
      setShowPayment(true);
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
     setShowCancelPixModal(true);
    setRemoveFormData({ name: '', whatsapp: '' });
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
          <button
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
              'aspect-square rounded-lg text-sm font-medium transition-all p-1',
              'flex flex-col items-center justify-center',
              slot.taken
                ? slot.entry?.paid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                : 'bg-white hover:bg-primary-100 hover:shadow-md border border-primary-200'
            )}
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
          </button>
        ))}
      </div>

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

      {showForm && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-800 mb-4">
              Reservar número {selectedSlot}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  required
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Os dados inseridos devem ser verdadeiros, pois entraremos em contato via WhatsApp para confirmar o envio do prêmio.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Reservando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-800 mb-4">
              Confirmar Dados para o número {selectedSlot}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              Por favor, confirme se os dados abaixo estão corretos, pois entraremos em contato via WhatsApp para confirmar o envio do prêmio:
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
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-800 mb-4">
              Pagamento via PIX
            </h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg w-full">
                <div className="flex items-start gap-3 text-sm text-primary-700 mb-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    Após realizar o pagamento, a Lara e a Mari irão verificar e confirmar seu pagamento.
                    Quando confirmado, seu número ficará verde com um check ✓
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center">
                  <QRCodeSVG value={PIX.PAYLOAD} size={200} />
                </div>
              </div>
              <div className="w-full p-4 bg-primary-50 rounded-lg">
                <p className="text-center font-medium text-primary-800 mb-2">
                  Valor a pagar: <span className="text-xl">R$ {PIX.PRICE},00</span>
                </p>
                <button
                  onClick={copyPixCode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  <Copy size={20} />
                  Copiar código PIX
                </button>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

{showCancelPixModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full">
      <h3 className="text-xl font-bold text-primary-800 mb-4">
        Pagamento via PIX
      </h3>
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-primary-50 p-4 rounded-lg w-full">
          <div className="flex items-start gap-3 text-sm text-primary-700 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Mesmo que o número esteja reservado, você pode cancelar a reserva. Veja os dados do PIX abaixo:
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center">
            <QRCodeSVG value={PIX.PAYLOAD} size={200} />
          </div>
        </div>
        <div className="w-full p-4 bg-primary-50 rounded-lg">
          <p className="text-center font-medium text-primary-800 mb-2">
            Valor a pagar: <span className="text-xl">R$ {PIX.PRICE},00</span>
          </p>
          <button
            onClick={copyPixCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
          >
            <Copy size={20} />
            Copiar código PIX
          </button>
        </div>
        {/* Botão para avançar para a tela de confirmação de cancelamento */}
        <button
          onClick={() => {
            setShowCancelPixModal(false);
            setShowRemoveModal(true);
          }}
          className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Deseja cancelar?
        </button>
        {/* Botão para fechar o modal sem cancelar */}
        <button
          onClick={() => setShowCancelPixModal(false)}
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}


      {showRemoveModal && slotToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-800 mb-4">
              Remover reserva do número {slotToRemove}
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Para confirmar a remoção, por favor, insira o mesmo Nome e WhatsApp usados no cadastro.
            </p>
            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div>
                <label htmlFor="remove-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="remove-name"
                  required
                  value={removeFormData.name}
                  onChange={(e) => setRemoveFormData({ ...removeFormData, name: e.target.value })}
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
                  onChange={(e) => setRemoveFormData({ ...removeFormData, whatsapp: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveModal(false)}
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
          </div>
        </div>
      )}
       <FloatingWhatsappButton />
    </div>
  );
};
