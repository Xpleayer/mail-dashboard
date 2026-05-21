"use client";

import { useEffect, useState } from "react";
import ReminderModal from "@/components/ReminderModal";

type Reminder = {
  id: number;
  client_name: string;
  client_email: string;
  type: string;
  send_at: string;
  status: string;
  subject: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  sent: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const res = await fetch("/api/reminders");
    setReminders(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Cancel this reminder?")) return;
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Reminders</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add reminder
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="text-left px-4 py-3 font-medium">Send at</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-10">
                  No reminders yet.
                </td>
              </tr>
            )}
            {reminders.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-white">
                  <div>{r.client_name}</div>
                  <div className="text-xs text-gray-500">{r.client_email}</div>
                </td>
                <td className="px-4 py-3 text-gray-400 capitalize">{r.type}</td>
                <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                  {r.subject}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(r.send_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColor[r.status] ?? "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:text-red-400 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ReminderModal
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
