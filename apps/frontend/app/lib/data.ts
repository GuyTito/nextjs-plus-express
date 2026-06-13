import { InvoicesTable, LatestInvoiceRaw, Revenue } from "@shared/types";

const API_URL = process.env.API_URL;

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log("Fetching revenue data...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // const data = await sql<Revenue[]>`SELECT * FROM revenue`;
    const data: Revenue[] = await fetch(`${API_URL}/revenue`).then((res) =>
      res.json(),
    );

    console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data: LatestInvoiceRaw[] = await fetch(
      `${API_URL}/invoices/latest`,
    ).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const data = await fetch(`${API_URL}/invoices/card-data`).then((res) =>
      res.json(),
    );
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  try {
    const data: InvoicesTable[] = await fetch(
      `${API_URL}/invoices/filtered?query=${query}&currentPage=${currentPage}`,
    ).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data: number = await fetch(
      `${API_URL}/invoices/pages?query=${query}`,
    ).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}
