import type {
  CustomerField,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  User,
} from "shared";
import { api } from "./api";

export async function fetchRevenue() {
  const data: Revenue[] = await api(`revenue`);
  return data;
}

export async function fetchLatestInvoices() {
  const data: LatestInvoiceRaw[] = await api(`invoices/latest`);
  return data;
}

export async function fetchCardData() {
  const data = await api(`invoices/card-data`);
  return data;
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const data: InvoicesTable[] = await api(
    `invoices?query=${query}&currentPage=${currentPage}`,
  );
  return data;
}

export async function fetchInvoicesPages(query: string) {
  const data: number = await api(`invoices/pages?query=${query}`);
  return data;
}

export async function fetchCustomers() {
  const data: CustomerField[] = await api(`customers`);
  return data;
}

export async function fetchInvoiceById(id: string) {
  const data: InvoiceForm = await api(`invoices/${id}`);
  return data;
}

export async function fetchCurrentUser() {
  const data: User = await api(`auth/user`);
  return data;
}
