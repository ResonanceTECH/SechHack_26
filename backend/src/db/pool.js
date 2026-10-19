import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example → .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon / cloud Postgres need TLS; local usually does not
  ssl:
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected idle client error", err);
});

export async function query(text, params) {
  return pool.query(text, params);
}
