import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT se.*, c.name AS client_name, c.email AS client_email
     FROM scheduled_emails se
     JOIN clients c ON c.id = se.client_id
     ORDER BY se.send_at DESC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { client_id, type, send_at, subject, body } = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO scheduled_emails (client_id, type, send_at, subject, body)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [client_id, type, send_at, subject, body]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
