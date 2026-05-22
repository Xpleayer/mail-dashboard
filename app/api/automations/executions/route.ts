import { NextResponse } from "next/server";
import { n8nFetch } from "@/lib/n8n";

export async function GET() {
  const [wfRes, exRes] = await Promise.all([
    n8nFetch("/workflows"),
    n8nFetch("/executions?limit=50"),
  ]);
  if (!wfRes.ok || !exRes.ok)
    return NextResponse.json({ error: "n8n error" }, { status: 502 });

  const wfData = await wfRes.json();
  const exData = await exRes.json();

  const mailboardIds = new Set<string>(
    (wfData.data ?? [])
      .filter((w: { name: string }) => w.name.startsWith("[Mailboard]"))
      .map((w: { id: string }) => w.id)
  );

  const nameMap: Record<string, string> = {};
  for (const w of wfData.data ?? []) nameMap[w.id] = w.name;

  const executions = (exData.data ?? [])
    .filter((e: { workflowId: string }) => mailboardIds.has(e.workflowId))
    .map((e: { id: string; workflowId: string; status: string; startedAt: string }) => ({
      id: e.id,
      workflowId: e.workflowId,
      workflowName: nameMap[e.workflowId] ?? "Unknown",
      status: e.status,
      startedAt: e.startedAt,
    }));

  return NextResponse.json(executions);
}
