import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  useEffect(() => {
    const fetchEntries = async () => {
      const entriesCollection = collection(db, 'entries');
      const entriesSnapshot = await getDocs(entriesCollection);
      const entriesList = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(entriesList);
    };

    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Utiliza as credenciais definidas no arquivo .env
    const adminUsername = import.meta.env.VITE_USERNAME;
    const adminPassword = import.meta.env.VITE_PASSWORD;
    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handlePaymentStatusUpdate = async (entryId: string, isPaid: boolean) => {
    const entryDocRef = doc(db, 'entries', entryId);
    await updateDoc(entryDocRef, {
      paid: !isPaid,
    });

    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === entryId ? { ...entry, paid: !entry.paid } : entry
      )
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'entries', entryId));
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      alert("Registro excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir registro: ", error);
      alert("Erro ao excluir registro.");
    }
  };

  // Pesquisa em múltiplos campos: nome, whatsapp, slotNumber e status de pagamento
  const filteredEntries = entries.filter(entry => {
    const fieldsToSearch = [
      entry.name || '',
      entry.whatsapp || '',
      entry.slotNumber ? entry.slotNumber.toString() : '',
      entry.paid ? 'sim' : 'não'
    ];
    const matchesSearchQuery = fieldsToSearch.some(field =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesPaymentStatus =
      paymentStatusFilter === 'all' ||
      (paymentStatusFilter === 'paid' && entry.paid) ||
      (paymentStatusFilter === 'unpaid' && !entry.paid);

    return matchesSearchQuery && matchesPaymentStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl mb-4">Painel Administrativo</h2>
        <input
          type="text"
          placeholder="Username"
          className="border rounded p-2 mb-2"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2 mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-primary-500 text-white rounded p-2" onClick={handleLogin}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar"
          className="border rounded p-2"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="paymentStatusFilter" className="mr-2">
          Filtrar por status de pagamento:
        </label>
        <select
          id="paymentStatusFilter"
          className="border rounded p-2"
          value={paymentStatusFilter}
          onChange={e => setPaymentStatusFilter(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="paid">Pagos</option>
          <option value="unpaid">Não Pagos</option>
        </select>
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">WhatsApp</th>
            <th className="px-4 py-2">Slot</th>
            <th className="px-4 py-2">Pago</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map(entry => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.name}</td>
              <td className="border px-4 py-2">{entry.whatsapp}</td>
              <td className="border px-4 py-2">{entry.slotNumber}</td>
              <td className="border px-4 py-2">{entry.paid ? 'Sim' : 'Não'}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button
                  className="bg-primary-500 text-white rounded p-2"
                  onClick={() => handlePaymentStatusUpdate(entry.id, entry.paid)}
                >
                  Alterar Status
                </button>
                <button
                  className="bg-red-500 text-white rounded p-2"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
