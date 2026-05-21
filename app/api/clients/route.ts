import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM clients ORDER BY name ASC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { name, email, service, billing_day, contract_end, notes } =
    await req.json();
  const { rows } = await pool.query(
    `INSERT INTO clients (name, email, service, billing_day, contract_end, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, email, service || null, billing_day || null, contract_end || null, notes || null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
