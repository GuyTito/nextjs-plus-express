import type { Request, Response } from "express";
import { sql } from "../lib/db";
import { type Revenue } from "shared";

export async function fetchRevenue(req: Request, res: Response) {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log("Data fetch completed after 3 seconds.");

    res.json(data);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}
