import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Le nom est requis.").max(100),
  email: z.email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  tosAccepted: z.literal(true, { error: "Vous devez accepter les CGU." }),
  turnstileToken: z.string().min(1, "Vérification anti-bot manquante."),
});

export const loginSchema = z.object({
  email: z.email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
  rememberMe: z.boolean().optional().default(false),
  turnstileToken: z.string().min(1, "Vérification anti-bot manquante."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Adresse email invalide."),
  turnstileToken: z.string().min(1, "Vérification anti-bot manquante."),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide (format HH:MM).");

export const slotSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Le nom du créneau est requis.").max(60),
  start: timeSchema,
  end: timeSchema,
});

export const slotsSchema = z.object({
  slots: z.array(slotSchema).max(50, "Trop de créneaux."),
});

export const programSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Le nom du programme est requis.").max(60),
  description: z.string().trim().max(200).optional().default(""),
  duration: z.number().min(30).max(480),
  delayStep: z
    .union([z.literal(30), z.literal(60), z.literal(120)])
    .optional()
    .default(60),
  delayMode: z.enum(["depart", "fin"]).optional().default("depart"),
});

export const machineSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Le nom de la machine est requis.").max(60),
  programs: z.array(programSchema).max(30).optional().default([]),
  builtIn: z.boolean().optional().default(false),
});

export const settingsSchema = z.object({
  machines: z.array(machineSchema).min(1, "Aucune machine à enregistrer."),
  duration: z.number().min(30).max(480).optional().default(150),
  selectedProgramId: z.string().optional(),
  calculationMode: z.enum(["soon", "last"]).optional().default("soon"),
});
