import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const sessionCookieName = "session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  userId: string;
  expiresAt: string;
};

function getEncodedSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }

  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedSecret());
}

export async function decryptSession(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, getEncodedSecret(), {
      algorithms: ["HS256"],
    });

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const session = await encryptSession({ userId, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(sessionCookieName)?.value;
  const payload = await decryptSession(session);

  if (!payload || new Date(payload.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return payload;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
