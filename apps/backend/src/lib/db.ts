import "dotenv/config";
import postgres from "postgres";

export const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) throw new Error("POSTGRES_URL is not set");
// const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
export const sql = postgres(POSTGRES_URL);
