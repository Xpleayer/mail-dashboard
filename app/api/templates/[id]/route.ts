import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, subject, body, type } = await req.json();
  const { rows } = await pool.query(
    `UPDATE templates SET name=$1, subject=$2, body=$3, type=$4
     WHERE id=$5 RETURNING *`,
    [name, subject, body, type || "general", params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await pool.query("DELETE FROM templates WHERE id=$1", [params.id]);
  return new NextResponse(null, { status: 204 });
}
