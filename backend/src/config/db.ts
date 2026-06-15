import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export async function checkDbConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}