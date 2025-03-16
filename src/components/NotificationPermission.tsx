// src/components/NotificationPermission.tsx
import React, { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import toast from 'react-hot-toast';

const NotificationPermission: React.FC = () => {
  useEffect(() => {
    const askPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Obter o token FCM usando sua chave VAPID pública
          const token = await getToken(messaging, { 
            vapidKey: 'BPL02bT46XkMuIrSXfSgTEjSUokMbkjgAfbA2ns_M35mXvb2TxMka4URdT_pCizkuPBTho84KCchD_Pf1isSAF8' 
          });
          console.log('FCM Token:', token);
          toast.success('Você aceitou receber atualizações sobre a rifa!');
        } else {
          toast('Você não aceitou receber notificações.');
        }
      } catch (error) {
        console.error('Erro ao solicitar permissões ou obter token:', error);
        toast.error('Erro ao configurar notificações.');
      }
    };

    askPermission();
  }, []);

  return null;
};

export default NotificationPermission;
