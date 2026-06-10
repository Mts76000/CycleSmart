import { Pool } from "pg";

type DbConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
};

let pool: Pool | undefined;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getDbConfig(): DbConfig {
  return {
    host: getRequiredEnv("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: getRequiredEnv("POSTGRES_DATABASE"),
    user: getRequiredEnv("POSTGRES_USER"),
    password: getRequiredEnv("POSTGRES_PASSWORD"),
    ssl: process.env.POSTGRES_SSL !== "false",
  };
}

export function getPool() {
  if (!pool) {
    const config = getDbConfig();

    pool = new Pool({
      ...config,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}

export async function query<T extends Record<string, unknown>>(text: string, params?: unknown[]) {
  const result = await getPool().query<T>(text, params);
  return result;
}

export async function ensureDatabaseSchema() {
  await query(`
    create table if not exists users (
      email text primary key,
      name text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists off_peak_slots (
      id text primary key,
      user_email text not null references users(email) on delete cascade,
      name text not null,
      start_time text not null,
      end_time text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}
