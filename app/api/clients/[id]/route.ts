import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, email, service, billing_day, contract_end, notes } =
    await req.json();
  const { rows } = await pool.query(
    `UPDATE clients SET name=$1, email=$2, service=$3, billing_day=$4, contract_end=$5, notes=$6
     WHERE id=$7 RETURNING *`,
    [name, email, service || null, billing_day || null, contract_end || null, notes || null, params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await pool.query("DELETE FROM clients WHERE id=$1", [params.id]);
  return new NextResponse(null, { status: 204 });
}
