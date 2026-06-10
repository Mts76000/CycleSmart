"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureDatabaseSchema, query } from "./db";
import { createSession, deleteSession } from "./session";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

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

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;
  await ensureDatabaseSchema();

  const existing = await query<{ id: string }>("select id from users where email = $1 limit 1", [email]);
  if (existing.rowCount) {
    return { message: "Un compte existe deja avec cette adresse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();
  await query(
    `
      insert into users (id, email, name, password_hash)
      values ($1, $2, $3, $4)
    `,
    [userId, email, name, passwordHash],
  );
  await createSession(userId);

  redirect("/profil");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  await ensureDatabaseSchema();

  const result = await query<{ id: string; password_hash: string }>(
    "select id, password_hash from users where email = $1 limit 1",
    [email],
  );
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    return { message: "Identifiants invalides." };
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { message: "Identifiants invalides." };
  }

  await createSession(user.id);
  redirect("/profil");
}

export async function logout() {
  await deleteSession();
  redirect("/connexion");
}
