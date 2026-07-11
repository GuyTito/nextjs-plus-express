"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  COOKIE_MAX_AGE_MS,
  InvoiceSchema,
  JWT_COOKIE_NAME,
  RegisterSchema,
} from "shared";
import { api, API_URL } from "./api";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";

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
  await api(`invoices`, {
    method: "POST",
    body: JSON.stringify({ customerId, amount, status }),
  });

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

  await api(`invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify({ customerId, amount, status }),
  });

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Cookie forwarding is been done here is because the server side of the nextjs acts a middle man between the client(user browser) and the express server.

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Check if response failed
    if (!response.ok) {
      // Try to read backend error payload, fallback to status text
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || response.statusText || "Invalid credentials";
      throw new Error(errorMessage);
    }

    // const data = await response.json();

    // Forward the backend's Set-Cookie to the actual browser.
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      const parsed = parseSetCookie(setCookieHeader);
      // parsed => { name: "jwt", value: "<token>", httpOnly: true, ... }

      if (parsed.name === JWT_COOKIE_NAME && parsed.value) {
        (await cookies()).set(JWT_COOKIE_NAME, parsed.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: Math.floor(COOKIE_MAX_AGE_MS / 1000), // Convert ms → seconds for Next.js
        });
      }
    }
  } catch (error: any) {
    // Next.js redirect uses an internal error, do not catch it
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    // Log the actual message string instead of stringifying the error object
    console.error("Authentication error:", error.message);
    return error.message || "Failed to authenticate";
  }

  // Next.js redirect must be called outside the try/catch block
  redirect(redirectTo);
}

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

export async function register(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields.",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const friendlyMessage =
        response.status === 409
          ? "An account with this email already exists."
          : errorData.message || "Failed to register.";
      return { message: friendlyMessage };
    }
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Registration error:", error.message);
    return { message: error.message || "Failed to register." };
  }

  redirect("/login?registered=1");
}

export async function signOut() {
  await api("auth/logout", { method: "POST" });

  (await cookies()).delete(JWT_COOKIE_NAME);
  redirect("/login");
}

export async function deleteInvoice(id: string) {
  await api(`invoices/${id}`, { method: "DELETE" });

  revalidatePath("/dashboard/invoices");
}
