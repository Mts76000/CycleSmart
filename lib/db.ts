import { Pool, type PoolConfig } from "pg";

let pool: Pool | undefined;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function shouldUseSsl(connectionString?: string) {
  const envSsl = process.env.POSTGRES_SSL?.trim().toLowerCase();

  if (envSsl) {
    return ["1", "true", "require", "required"].includes(envSsl);
  }

  if (connectionString) {
    try {
      return new URL(connectionString).searchParams.get("sslmode") === "require";
    } catch {
      return false;
    }
  }

  return false;
}

function getSslConfig(connectionString?: string) {
  return shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false;
}

function getDbConfig(): PoolConfig {
  const connectionString =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  const base = {
    // Fail fast if Postgres is unreachable so the UI can fall back to guest mode.
    connectionTimeoutMillis: 3000,
    query_timeout: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
  };

  if (connectionString) {
    return {
      ...base,
      connectionString,
      ssl: getSslConfig(connectionString),
    };
  }

  return {
    ...base,
    host: getRequiredEnv("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: getRequiredEnv("POSTGRES_DATABASE"),
    user: getRequiredEnv("POSTGRES_USER"),
    password: getRequiredEnv("POSTGRES_PASSWORD"),
    ssl: getSslConfig(),
  };
}

export function getPool() {
  if (!pool) {
    pool = new Pool(getDbConfig());

    // Reset the pool on unexpected client errors so the next call can
    // attempt a fresh connection.
    pool.on("error", (error) => {
      console.error("Postgres pool error, resetting pool", error);
      pool = undefined;
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

  await query(`
    create table if not exists password_reset_tokens (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      token_hash text not null unique,
      expires_at timestamptz not null,
      used_at timestamptz,
      created_at timestamptz not null default now()
    )
  `);

  await query(`create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens(user_id)`);

  await query(`
    create table if not exists cycle_devices (
      id text not null,
      user_id text not null references users(id) on delete cascade,
      name text not null,
      description text not null default '',
      default_duration integer,
      delay_step integer,
      built_in boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (user_id, id)
    )
  `);

  await query(`alter table cycle_devices add column if not exists programs jsonb not null default '[]'::jsonb`);
  await query(`alter table cycle_devices alter column default_duration drop not null`);
  await query(`alter table cycle_devices alter column delay_step drop not null`);

  await query(`
    create table if not exists cycle_preferences (
      user_id text primary key references users(id) on delete cascade,
      selected_device_id text,
      duration integer not null default 150,
      finish_mode text not null default 'soon',
      finish_mode_configured boolean not null default false,
      updated_at timestamptz not null default now()
    )
  `);

  await query(`alter table cycle_preferences add column if not exists calculation_mode text not null default 'soon'`);
  await query(`alter table cycle_preferences add column if not exists selected_program_id text`);
}
