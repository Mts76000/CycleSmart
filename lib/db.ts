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
      id text primary key,
      email text unique not null,
      name text not null,
      password_hash text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`alter table users add column if not exists id text`);
  await query(`alter table users add column if not exists password_hash text not null default ''`);
  await query(`alter table users add column if not exists updated_at timestamptz not null default now()`);
  await query(`update users set id = email where id is null or id = ''`);
  await query(`create unique index if not exists users_id_unique on users(id)`);
  await query(`create unique index if not exists users_email_unique on users(email)`);

  await query(`
    create table if not exists off_peak_slots (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      name text not null,
      start_time text not null,
      end_time text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`alter table off_peak_slots add column if not exists user_id text`);
  await query(`
    update off_peak_slots
    set user_id = users.id
    from users
    where off_peak_slots.user_id is null
      and off_peak_slots.user_email = users.email
  `).catch(() => undefined);
}
