"use client";

import { useEffect, useState } from "react";

type Template = { id: number; name: string };
type Workflow = {
  id: string;
  name: string;
  active: boolean;
  updatedAt: string;
};
type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
};

const statusColor: Record<string, string> = {
  success: "bg-green-500/10 text-green-400",
  error: "bg-red-500/10 text-red-400",
  running: "bg-blue-500/10 text-blue-400",
  waiting: "bg-yellow-500/10 text-yellow-400",
};

export default function AutomationsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [billingForm, setBillingForm] = useState({
    templateId: "",
    time: "09:00",
    active: true,
  });
  const [billingSaving, setBillingSaving] = useState(false);
  const [billingStatus, setBillingStatus] = useState<"idle" | "ok" | "error">("idle");

  const [toggling, setToggling] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  async function loadAll() {
    setError("");
    const [wfRes, exRes, tplRes] = await Promise.all([
      fetch("/api/automations/workflows"),
      fetch("/api/automations/executions"),
      fetch("/api/templates"),
    ]);
    if (!wfRes.ok) {
      setError("Could not connect to n8n. Check N8N_API_URL and N8N_API_KEY.");
    } else {
      setWorkflows(await wfRes.json());
    }
    if (exRes.ok) setExecutions(await exRes.json());
    if (tplRes.ok) setTemplates(await tplRes.json());
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function saveBillingReminder(e: React.FormEvent) {
    e.preventDefault();
    setBillingSaving(true);
    setBillingStatus("idle");
    const res = await fetch("/api/automations/billing-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: parseInt(billingForm.templateId),
        time: billingForm.time,
        active: billingForm.active,
      }),
    });
    setBillingSaving(false);
    setBillingStatus(res.ok ? "ok" : "error");
    if (res.ok) loadAll();
  }

  async function toggleWorkflow(id: string, currentActive: boolean) {
    setToggling(id);
    await fetch(`/api/automations/workflows/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    setToggling(null);
    loadAll();
  }

  async function executeWorkflow(id: string) {
    setExecuting(id);
    await fetch(`/api/automations/workflows/${id}/execute`, { method: "POST" });
    setExecuting(null);
    loadAll();
  }

  const lastBillingExecution = executions.find((e) =>
    e.workflowName === "[Mailboard] Billing Reminders"
  );

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-white">Automations</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Billing Reminder Setup */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          Billing Reminder Setup
        </h2>
        <form onSubmit={saveBillingReminder} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Template<span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={billingForm.templateId}
              onChange={(e) =>
                setBillingForm((f) => ({ ...f, templateId: e.target.value }))
              }
              required
              className={inputCls}
            >
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Send time (daily)
            </label>
            <input
              type="time"
              value={billingForm.time}
              onChange={(e) =>
                setBillingForm((f) => ({ ...f, time: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={billingForm.active}
              onClick={() =>
                setBillingForm((f) => ({ ...f, active: !f.active }))
              }
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                billingForm.active ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  billingForm.active ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">
              {billingForm.active ? "Enabled" : "Disabled"}
            </span>
          </div>
          {lastBillingExecution && (
            <p className="text-xs text-gray-500">
              Last run:{" "}
              <span
                className={
                  lastBillingExecution.status === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastBillingExecution.status}
              </span>{" "}
              — {new Date(lastBillingExecution.startedAt).toLocaleString()}
            </p>
          )}
          {billingStatus === "ok" && (
            <p className="text-green-400 text-sm">Workflow saved to n8n.</p>
          )}
          {billingStatus === "error" && (
            <p className="text-red-400 text-sm">Failed to save workflow.</p>
          )}
          <button
            type="submit"
            disabled={billingSaving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {billingSaving ? "Saving…" : "Save to n8n"}
          </button>
        </form>
      </section>

      {/* Mailboard Workflows */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-3">
          Mailboard Workflows
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-10">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && workflows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-10">
                    No Mailboard workflows yet.
                  </td>
                </tr>
              )}
              {workflows.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-white">{w.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        w.active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {w.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(w.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => toggleWorkflow(w.id, w.active)}
                      disabled={toggling === w.id}
                      className="text-gray-400 hover:text-white text-xs transition-colors disabled:opacity-50"
                    >
                      {toggling === w.id
                        ? "…"
                        : w.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                    <button
                      onClick={() => executeWorkflow(w.id)}
                      disabled={executing === w.id}
                      className="text-blue-400 hover:text-blue-300 text-xs transition-colors disabled:opacity-50"
                    >
                      {executing === w.id ? "Running…" : "Run now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Executions */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-3">
          Recent Executions
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800/50">
          {executions.length === 0 && (
            <p className="text-center text-gray-500 py-10 text-sm">
              No executions yet.
            </p>
          )}
          {executions.slice(0, 20).map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">{ex.workflowName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(ex.startedAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  statusColor[ex.status] ?? "bg-gray-700 text-gray-400"
                }`}
              >
                {ex.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500";
