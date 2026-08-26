import "server-only";

import type React from "react";
import { Resend } from "resend";
import { render, toPlainText } from "react-email";
import { NewSignupEmail } from "@/emails/new-signup";

let resend: Resend | undefined;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error("Missing CONTACT_FROM_EMAIL.");
  }

  const html = await render(react);
  const text = toPlainText(html);

  const { data, error } = await getResend().emails.send({
    from: `CycleSmart <${fromEmail}>`,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Resend send error:", JSON.stringify(error));
    throw new Error(error.message);
  }

  return data;
}

export async function notifyAdminOfSignup({
  userEmail,
  userName,
  signedUpAt,
}: {
  userEmail: string;
  userName?: string;
  signedUpAt: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not configured, skipping admin signup notification.");
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: "Nouvelle inscription - CycleSmart",
    react: NewSignupEmail({
      userEmail,
      userName,
      signedUpAt,
      projectName: "CycleSmart",
    }),
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error("Missing CONTACT_FROM_EMAIL.");
  }

  const { error } = await getResend().emails.send({
    from: `CycleSmart <${fromEmail}>`,
    to,
    subject: "Reinitialise ton mot de passe CycleSmart",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h1 style="font-size:22px;margin:0 0 16px">Reinitialise ton mot de passe</h1>
        <p>Tu as demande a changer le mot de passe de ton compte CycleSmart.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#059669;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="color:#475569">Ce lien est valable 30 minutes. Si tu n'es pas a l'origine de cette demande, ignore cet e-mail.</p>
      </div>
    `,
    text: `Reinitialise ton mot de passe CycleSmart : ${resetUrl}\n\nCe lien est valable 30 minutes. Si tu n'es pas a l'origine de cette demande, ignore cet e-mail.`,
  });

  if (error) {
    console.error("Resend send error:", JSON.stringify(error));
    throw new Error(error.message);
  }
}
