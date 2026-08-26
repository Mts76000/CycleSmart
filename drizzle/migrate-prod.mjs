// Plain JS (no TypeScript, no tsx, no dotenv) so this can run in the Docker runtime image,
// which only ships production dependencies (drizzle-orm, pg — both already required by the
// app itself) and not devDependencies. Run before the server starts (see Dockerfile CMD).
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set.");

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

console.log("Running migrations...");
await migrate(db, { migrationsFolder: "./drizzle/migrations" });
console.log("Migrations complete.");

await pool.end();
