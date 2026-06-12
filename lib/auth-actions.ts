"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "./current-user";
import { ensureDatabaseSchema, query } from "./db";
import { sendPasswordResetEmail } from "./email";
import { createSession, deleteSession } from "./session";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        currentPassword?: string[];
        newPassword?: string[];
        confirmPassword?: string[];
        token?: string[];
      };
      message?: string;
      values?: {
        name?: string;
        email?: string;
      };
    }
  | undefined;

type AuthFormValues = NonNullable<AuthFormState>["values"];

const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caracteres.").trim(),
  email: z.email("Adresse e-mail invalide.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caracteres.")
    .regex(/[a-zA-Z]/, "Ajoute au moins une lettre.")
    .regex(/[0-9]/, "Ajoute au moins un chiffre.")
    .trim(),
});

const loginSchema = signupSchema.pick({ email: true, password: true });
const passwordResetRequestSchema = signupSchema.pick({ email: true });
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Entre ton mot de passe actuel."),
    newPassword: signupSchema.shape.password,
    confirmPassword: z.string().min(1, "Confirme le nouveau mot de passe."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
const resetPasswordSchema = z
  .object({
    token: z.string().min(32, "Lien de reinitialisation invalide."),
    newPassword: signupSchema.shape.password,
    confirmPassword: z.string().min(1, "Confirme le nouveau mot de passe."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

function databaseUnavailable(values: AuthFormValues): NonNullable<AuthFormState> {
  return {
    message: "Connexion au compte indisponible pour le moment. Reessaie dans quelques instants.",
    values,
  };
}

function sessionUnavailable(values: AuthFormValues): NonNullable<AuthFormState> {
  return {
    message: "Connexion au compte indisponible pour le moment. Reessaie dans quelques instants.",
    values,
  };
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getAppOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "http";

  if (!host) {
    throw new Error("Unable to resolve app origin.");
  }

  return `${protocol}://${host}`;
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
  };
  const validated = signupSchema.safeParse({
    name: values.name,
    email: values.email,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values };
  }

  const { name, email, password } = validated.data;
  let userId = "";

  try {
    await ensureDatabaseSchema();

    const existing = await query<{ id: string }>("select id from users where email = $1 limit 1", [email]);
    if (existing.rowCount) {
      return { message: "Un compte existe deja avec cette adresse e-mail.", values: { name, email } };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    userId = randomUUID();
    await query(
      `
        insert into users (id, email, name, password_hash)
        values ($1, $2, $3, $4)
      `,
      [userId, email, name, passwordHash],
    );
  } catch (error) {
    console.error("Signup failed", error);
    return databaseUnavailable({ name, email });
  }

  try {
    await createSession(userId, true);
  } catch (error) {
    console.error("Session creation failed", error);
    return sessionUnavailable({ name, email });
  }

  redirect("/profil");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = {
    email: String(formData.get("email") || ""),
  };
  const validated = loginSchema.safeParse({
    email: values.email,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values };
  }

  const { email, password } = validated.data;
  const remember = formData.get("remember") === "yes";
  let userId = "";

  try {
    await ensureDatabaseSchema();

    const result = await query<{ id: string; password_hash: string }>(
      "select id, password_hash from users where email = $1 limit 1",
      [email],
    );
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return { message: "Identifiants invalides.", values: { email } };
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return { message: "Identifiants invalides.", values: { email } };
    }

    userId = user.id;
  } catch (error) {
    console.error("Login failed", error);
    return databaseUnavailable({ email });
  }

  try {
    await createSession(userId, remember);
  } catch (error) {
    console.error("Session creation failed", error);
    return sessionUnavailable({ email });
  }

  redirect("/profil");
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    email: String(formData.get("email") || ""),
  };
  const validated = passwordResetRequestSchema.safeParse(values);

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values };
  }

  const { email } = validated.data;
  const genericMessage = "Si un compte existe avec cette adresse, un e-mail vient d'etre envoye.";

  try {
    await ensureDatabaseSchema();

    const user = await query<{ id: string }>("select id from users where email = $1 limit 1", [email]);
    const userId = user.rows[0]?.id;

    if (!userId) {
      return { message: genericMessage, values: { email } };
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashResetToken(token);
    const resetUrl = `${await getAppOrigin()}/mot-de-passe-oublie/nouveau?token=${token}`;

    await query(
      `
        insert into password_reset_tokens (id, user_id, token_hash, expires_at)
        values ($1, $2, $3, now() + interval '30 minutes')
      `,
      [randomUUID(), userId, tokenHash],
    );

    await sendPasswordResetEmail({ to: email, resetUrl });

    return { message: genericMessage, values: { email } };
  } catch (error) {
    console.error("Password reset request failed", error);
    return {
      message: "Impossible d'envoyer l'e-mail pour le moment. Reessaie dans quelques instants.",
      values: { email },
    };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/connexion");
}

export async function changePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { currentPassword, newPassword } = validated.data;

  try {
    const user = await requireCurrentUser();
    const result = await query<{ password_hash: string }>(
      "select password_hash from users where id = $1 limit 1",
      [user.id],
    );
    const passwordHash = result.rows[0]?.password_hash;
    const passwordMatches = passwordHash && (await bcrypt.compare(currentPassword, passwordHash));

    if (!passwordMatches) {
      return {
        errors: {
          password: ["Mot de passe actuel incorrect."],
        },
      };
    }

    await query("update users set password_hash = $1, updated_at = now() where id = $2", [
      await bcrypt.hash(newPassword, 12),
      user.id,
    ]);

    return { message: "Mot de passe modifie." };
  } catch (error) {
    console.error("Password change failed", error);
    return {
      message: "Impossible de modifier le mot de passe pour le moment.",
    };
  }
}

export async function resetPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { token, newPassword } = validated.data;
  let userId = "";

  try {
    await ensureDatabaseSchema();

    const result = await query<{ id: string; user_id: string }>(
      `
        select id, user_id
        from password_reset_tokens
        where token_hash = $1
          and used_at is null
          and expires_at > now()
        limit 1
      `,
      [hashResetToken(token)],
    );
    const resetToken = result.rows[0];

    if (!resetToken) {
      return { message: "Ce lien n'est plus valide. Demande un nouveau lien." };
    }

    userId = resetToken.user_id;
    await query("update users set password_hash = $1, updated_at = now() where id = $2", [
      await bcrypt.hash(newPassword, 12),
      userId,
    ]);
    await query("update password_reset_tokens set used_at = now() where id = $1", [resetToken.id]);
  } catch (error) {
    console.error("Password reset failed", error);
    return { message: "Impossible de modifier le mot de passe pour le moment." };
  }

  try {
    await createSession(userId, true);
  } catch (error) {
    console.error("Session creation after password reset failed", error);
    return { message: "Mot de passe modifie. Connecte-toi avec ton nouveau mot de passe." };
  }

  redirect("/profil");
}
