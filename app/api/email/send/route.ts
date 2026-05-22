import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  const { to, subject, body, replyTo } = await req.json();
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      replyTo: replyTo || process.env.SMTP_FROM,
      subject,
      html: body,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
