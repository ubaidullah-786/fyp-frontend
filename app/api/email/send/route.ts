import "server-only";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Lazy import nodemailer (server only)
let _nodemailer: typeof import("nodemailer") | null = null;
const getNodemailer = async () => {
  if (_nodemailer) return _nodemailer;
  _nodemailer = await import("nodemailer");
  return _nodemailer;
};

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function badRequest(message = "Bad Request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

function getEnv(name: string, required = false) {
  const v = process.env[name];
  if (required && !v) throw new Error(`Missing required env ${name}`);
  return v;
}

async function sendViaGmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
}) {
  const nodemailer = await getNodemailer();
  const user = getEnv("GMAIL_USERNAME", true)!;
  const pass = getEnv("GMAIL_PASSWORD", true)!; // App Password recommended

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: from || user,
    to,
    subject,
    html,
    text,
  });
  return { id: info?.messageId ?? null, provider: "gmail" };
}

async function sendViaSmtp({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
}) {
  const nodemailer = await getNodemailer();
  const host = getEnv("SMTP_HOST", true)!;
  const port = Number(getEnv("SMTP_PORT", true));
  const user = getEnv("SMTP_USER", true)!;
  const pass = getEnv("SMTP_PASS", true)!;
  const secure = port === 465; // 465 true, others false

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  const info = await transporter.sendMail({
    from: from || user,
    to,
    subject,
    html,
    text,
  });
  return { id: info?.messageId ?? null, provider: "smtp" };
}

export async function POST(req: NextRequest) {
  try {
    // Shared secret check
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const expected = process.env.EMAIL_SECRET;
    if (!expected || token !== expected) {
      return unauthorized();
    }

    const body = await req.json().catch(() => ({}));
    const { to, subject, html, text, from } = body || {};
    if (!to || !subject || !html) {
      return badRequest('Fields "to", "subject", and "html" are required');
    }

    const provider = (process.env.EMAIL_PROVIDER || "").toUpperCase();

    let result: any;
    if (provider === "SMTP") {
      result = await sendViaSmtp({ to, subject, html, text, from });
    } else if (provider === "GMAIL" || process.env.GMAIL_USERNAME) {
      // Default to Gmail when GMAIL_USERNAME is present
      result = await sendViaGmail({ to, subject, html, text, from });
    } else if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      result = await sendViaSmtp({ to, subject, html, text, from });
    } else {
      return badRequest(
        "No email provider configured. Set EMAIL_PROVIDER=GMAIL with GMAIL_USERNAME/GMAIL_PASSWORD, or EMAIL_PROVIDER=SMTP with SMTP_* envs."
      );
    }

    return NextResponse.json({ status: "ok", ...result });
  } catch (err: any) {
    console.error("Email API error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to send email", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
