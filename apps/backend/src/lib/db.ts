import "dotenv/config";
import postgres from "postgres";

export const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) throw new Error("POSTGRES_URL is not set");

const isProduction = process.env.NODE_ENV === "production";
export const sql = postgres(POSTGRES_URL, isProduction ? { ssl: "require" } : undefined);
