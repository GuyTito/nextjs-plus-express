import "dotenv/config";
import postgres from "postgres";

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
export const sql = postgres(process.env.POSTGRES_URL!);
