"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceSchema } from "shared";
const API_URL = process.env.API_URL;

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = InvoiceSchema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId, amount, status }),
    });
    if (!response.ok) {
      throw new Error("Failed to create invoice");
    }
    const data = await response.json();
    console.log(`Success! Invoice created.`, data);
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    throw new Error("Error:", error!);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = InvoiceSchema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId, amount, status }),
    });
    if (!response.ok) {
      throw new Error("Failed to create invoice");
    }
    const data = await response.json();
    console.log(`Success! Invoice created.`, data);
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    throw new Error("Error:", error!);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
