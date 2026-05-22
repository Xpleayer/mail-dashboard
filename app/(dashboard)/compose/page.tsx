"use client";

import { useEffect, useState } from "react";

type Client = { id: number; name: string; email: string };
type Template = { id: number; name: string; subject: string; body: string };

export default function ComposePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clientId, setClientId] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  const toEmail =
    clientId === "custom"
      ? customEmail
      : clients.find((c) => c.id === parseInt(clientId))?.email ?? "";

  function loadTemplate(id: string) {
    const t = templates.find((t) => t.id === parseInt(id));
    if (t) { setSubject(t.subject); setBody(t.body); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("idle");
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toEmail, subject, body, replyTo }),
    });
    setSending(false);
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) {
      setSubject(""); setBody(""); setClientId("");
      setCustomEmail(""); setReplyTo("");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-white mb-6">Compose email</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5"
      >
        {templates.length > 0 && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Load template
            </label>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) loadTemplate(e.target.value); }}
              className={selectCls}
            >
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Recipient</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className={selectCls}
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
            <option value="custom">Custom email…</option>
          </select>
        </div>
        {clientId === "custom" && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Email address<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Reply-To
          </label>
          <input
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="Optional — defaults to sender address"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Subject<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Body<span className="text-red-400 ml-0.5">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={8}
            className={inputCls + " resize-none"}
          />
        </div>
        {status === "ok" && (
          <p className="text-green-400 text-sm">Email sent successfully.</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">Failed to send. Try again.</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {sending ? "Sending…" : "Send now"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500";
const selectCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500";
