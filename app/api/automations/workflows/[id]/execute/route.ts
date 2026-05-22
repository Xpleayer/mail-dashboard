import { NextResponse } from "next/server";
import { n8nFetch } from "@/lib/n8n";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const res = await n8nFetch(`/workflows/${params.id}/execute`, {
    method: "POST",
  });
  if (!res.ok) return NextResponse.json({ error: "n8n error" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
