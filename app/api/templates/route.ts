import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM templates ORDER BY name ASC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { name, subject, body, type } = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO templates (name, subject, body, type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, subject, body, type || "general"]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
