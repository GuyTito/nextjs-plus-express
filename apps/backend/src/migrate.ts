import "dotenv/config";
import path from "node:path";
import { runner } from "node-pg-migrate";

export async function runMigrations(): Promise<void> {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not set");
  }

  await runner({
    databaseUrl: process.env.POSTGRES_URL,
    dir: path.join(__dirname, "..", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    schema: "public",
    log: (msg: string) => console.log(`[migrate] ${msg}`),
  });
}
