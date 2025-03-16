import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const AdminPanel: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      const entriesCollection = collection(db, "entries");
      const entriesSnapshot = await getDocs(entriesCollection);
      const entriesList = entriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      }));
      setEntries(entriesList);
    };

    fetchEntries();
  }, []);

  const handlePaymentStatusUpdate = async (entryId: string, isPaid: boolean) => {
    const entryDocRef = doc(db, "entries", entryId);
    await updateDoc(entryDocRef, {
      paid: !isPaid,
    });

    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, paid: !entry.paid } : entry
      )
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "entries", entryId));
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
      alert("Registro excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir registro: ", error);
      alert("Erro ao excluir registro.");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleLogout = () => {
    // Limpar o localStorage e alterar o estado
    localStorage.removeItem("isAuthenticated");
    navigate("/login"); // Redireciona para a página de login
  };

  const filteredEntries = entries
    .filter((entry) => {
      const fieldsToSearch = [
        entry.name || "",
        entry.whatsapp || "",
        entry.slotNumber ? entry.slotNumber.toString() : "",
        entry.paid ? "sim" : "não",
      ];
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        (paymentStatusFilter === "paid" && entry.paid) ||
        (paymentStatusFilter === "unpaid" && !entry.paid);

      return matchesSearchQuery && matchesPaymentStatus;
    })
    .sort((a, b) => {
      return sortOrder === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>
      <div className="flex justify-between items-center mt-8 mb-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Pesquisar"
          className="border rounded p-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-blue-500 text-white rounded p-2" onClick={toggleSortOrder}>
          Ordenar por data ({sortOrder === "asc" ? "Mais antigos" : "Mais recentes"})
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="paymentStatusFilter" className="mr-2">
          Filtrar por status de pagamento:
        </label>
        <select
          id="paymentStatusFilter"
          className="border rounded p-2"
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
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
            <th className="px-4 py-2">Data de Criação</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.name}</td>
              <td className="border px-4 py-2">{entry.whatsapp}</td>
              <td className="border px-4 py-2">{entry.slotNumber}</td>
              <td className="border px-4 py-2">{entry.paid ? "Sim" : "Não"}</td>
              <td className="border px-4 py-2">
                {entry.createdAt.toLocaleDateString("pt-BR")}{" "}
                {entry.createdAt.toLocaleTimeString("pt-BR")}
              </td>
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
