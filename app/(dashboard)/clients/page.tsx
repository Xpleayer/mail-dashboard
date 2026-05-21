"use client";

import { useEffect, useState } from "react";
import ClientModal from "@/components/ClientModal";

type Client = {
  id: number;
  name: string;
  email: string;
  service: string | null;
  billing_day: number | null;
  contract_end: string | null;
  notes: string | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  async function load() {
    const res = await fetch("/api/clients");
    setClients(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  }

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(c: Client) { setEditing(c); setModalOpen(true); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Clients</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add client
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Service</th>
              <th className="text-left px-4 py-3 font-medium">Billing day</th>
              <th className="text-left px-4 py-3 font-medium">Contract end</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-10">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-white">{c.name}</td>
                <td className="px-4 py-3 text-gray-300">{c.email}</td>
                <td className="px-4 py-3 text-gray-400">{c.service ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400">
                  {c.billing_day ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {c.contract_end
                    ? new Date(c.contract_end).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ClientModal
          client={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
