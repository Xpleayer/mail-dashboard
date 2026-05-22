"use client";

import { useEffect, useState } from "react";
import TemplateModal from "@/components/TemplateModal";

type Template = {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: string;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  async function load() {
    const res = await fetch("/api/templates");
    setTemplates(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(t: Template) { setEditing(t); setModalOpen(true); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Templates</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add template
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-10">
                  No templates yet.
                </td>
              </tr>
            )}
            {templates.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-white">{t.name}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{t.type}</td>
                <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                  {t.subject}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
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
        <TemplateModal
          template={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
