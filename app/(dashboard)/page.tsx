import pool from "@/lib/db";

async function getStats() {
  const [clients, pending, sentThisMonth, recent] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM clients"),
    pool.query("SELECT COUNT(*) FROM scheduled_emails WHERE status='pending'"),
    pool.query(
      "SELECT COUNT(*) FROM scheduled_emails WHERE status='sent' AND DATE_TRUNC('month', sent_at) = DATE_TRUNC('month', NOW())"
    ),
    pool.query(
      `SELECT se.id, se.type, se.status, se.send_at, se.sent_at, c.name AS client_name
       FROM scheduled_emails se
       JOIN clients c ON c.id = se.client_id
       ORDER BY COALESCE(se.sent_at, se.send_at) DESC
       LIMIT 10`
    ),
  ]);
  return {
    totalClients: parseInt(clients.rows[0].count),
    pendingEmails: parseInt(pending.rows[0].count),
    sentThisMonth: parseInt(sentThisMonth.rows[0].count),
    recentActivity: recent.rows,
  };
}

const statusColor: Record<string, string> = {
  pending: "text-yellow-400",
  sent: "text-green-400",
  failed: "text-red-400",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total clients" value={stats.totalClients} />
        <StatCard label="Pending emails" value={stats.pendingEmails} />
        <StatCard label="Sent this month" value={stats.sentThisMonth} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-medium text-gray-300">Recent activity</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentActivity.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-10">
                  No activity yet.
                </td>
              </tr>
            )}
            {stats.recentActivity.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-white">{row.client_name}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">
                  {row.type}
                </td>
                <td
                  className={`px-4 py-3 capitalize ${
                    statusColor[row.status] ?? "text-gray-400"
                  }`}
                >
                  {row.status}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(
                    row.sent_at ?? row.send_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
