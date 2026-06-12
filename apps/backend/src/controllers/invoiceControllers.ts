import type { Request, Response } from "express";
import { sql } from "../lib/db";
import { LatestInvoiceRaw } from "@shared/types";
import { formatCurrency } from "../lib/utils";

export async function fetchLatestInvoices(req: Request, res: Response) {
  try {
    const latestInvoices = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const data = latestInvoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    res.json(data);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}
