"use client";

import { useState } from "react";

type Client = {
  id: number;
  name: string;
  email: string;
  service: string | null;
  billing_day: number | null;
  contract_end: string | null;
  notes: string | null;
};

type Props = {
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ClientModal({ client, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: client?.name ?? "",
    email: client?.email ?? "",
    service: client?.service ?? "",
    billing_day: client?.billing_day?.toString() ?? "",
    contract_end: client?.contract_end
      ? client.contract_end.slice(0, 10)
      : "",
    notes: client?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      name: form.name,
      email: form.email,
      service: form.service || null,
      billing_day: form.billing_day ? parseInt(form.billing_day) : null,
      contract_end: form.contract_end || null,
      notes: form.notes || null,
    };
    const res = await fetch(
      client ? `/api/clients/${client.id}` : "/api/clients",
      {
        method: client ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSaving(false);
    if (!res.ok) {
      setError("Failed to save. Check input and try again.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-white mb-5">
          {client ? "Edit client" : "Add client"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Service">
            <input
              value={form.service}
              onChange={(e) => set("service", e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Billing day">
              <input
                type="number"
                min={1}
                max={31}
                value={form.billing_day}
                onChange={(e) => set("billing_day", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Contract end">
              <input
                type="date"
                value={form.contract_end}
                onChange={(e) => set("contract_end", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500";
