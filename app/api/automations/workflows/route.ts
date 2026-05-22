import { NextResponse } from "next/server";
import { n8nFetch } from "@/lib/n8n";

export async function GET() {
  const res = await n8nFetch("/workflows");
  if (!res.ok) return NextResponse.json({ error: "n8n error" }, { status: 502 });
  const data = await res.json();
  const workflows = (data.data ?? []).filter((w: { name: string }) =>
    w.name.startsWith("[Mailboard]")
  );
  return NextResponse.json(workflows);
}
