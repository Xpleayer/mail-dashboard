"use client";

import { useEffect, useState } from "react";

type Client = { id: number; name: string; email: string };

type Props = { onClose: () => void; onSaved: () => void };

export default function ReminderModal({ onClose, onSaved }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    type: "invoice",
    send_at: "",
    subject: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: parseInt(form.client_id),
        type: form.type,
        send_at: form.send_at,
        subject: form.subject,
        body: form.body,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save reminder."); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-white mb-5">
          Add reminder
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Client<span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={form.client_id}
              onChange={(e) => set("client_id", e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputCls}
            >
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Send at<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.send_at}
              onChange={(e) => set("send_at", e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Subject<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Body<span className="text-red-400 ml-0.5">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              required
              rows={4}
              className={inputCls + " resize-none"}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500";
