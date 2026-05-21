import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${process.env.N8N_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  await pool.query(
    `UPDATE scheduled_emails SET status=$1, sent_at=NOW() WHERE id=$2`,
    [status, id]
  );
  return NextResponse.json({ ok: true });
}
