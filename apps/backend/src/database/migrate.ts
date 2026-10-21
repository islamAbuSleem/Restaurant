import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function run(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[db:migrate] DATABASE_URL is not set");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: "src/database/migrations" });
    console.log("[db:migrate] migrations applied");
  } finally {
    await pool.end();
  }
}

void run();
