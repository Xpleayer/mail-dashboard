import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, subject, body } = await req.json();
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to,
    subject,
    text: body,
  });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
