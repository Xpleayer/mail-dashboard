import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await pool.query("DELETE FROM scheduled_emails WHERE id=$1", [params.id]);
  return new NextResponse(null, { status: 204 });
}
