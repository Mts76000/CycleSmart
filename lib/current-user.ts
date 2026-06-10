import "server-only";

import { ensureDatabaseSchema, query } from "./db";
import { getSession } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  try {
    await ensureDatabaseSchema();
    const result = await query<CurrentUser>(
      "select id, name, email from users where id = $1 limit 1",
      [session.userId],
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Current user lookup failed", error);
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}
