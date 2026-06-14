import { CustomerField } from "shared";
import { sql } from "../lib/db";
import { RequestHandler } from "express";

export const fetchCustomers: RequestHandler = async (req, res) => {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return res.json(customers);
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
};
