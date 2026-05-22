"use client";

import { useState } from "react";

type Template = {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: string;
};

type Props = {
  template: Template | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function TemplateModal({ template, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: template?.name ?? "",
    type: template?.type ?? "general",
    subject: template?.subject ?? "",
    body: template?.body ?? "",
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
    const res = await fetch(
      template ? `/api/templates/${template.id}` : "/api/templates",
      {
        method: template ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    setSaving(false);
    if (!res.ok) { setError("Failed to save template."); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-white mb-5">
          {template ? "Edit template" : "Add template"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Name<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputCls}
            >
              <option value="general">General</option>
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
            </select>
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
              rows={5}
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
