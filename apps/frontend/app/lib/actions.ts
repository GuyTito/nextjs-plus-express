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

export type VerifyOtpState = {
  message?: string | null;
};

export type ResendOtpState = {
  message?: string | null;
};

export async function verifyOtp(
  prevState: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;
  const type = formData.get("type") as string;

  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, type }),
    });

    if (response.ok) {
      redirect("/login?verified=1");
    }

    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || "Verification failed.";
    return { message };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Verify OTP error:", error.message);
    return { message: error.message || "Failed to verify." };
  }
}

export async function resendOtp(
  prevState: ResendOtpState,
  formData: FormData,
): Promise<ResendOtpState> {
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;

  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { message: data.message || "Verification code sent." };
    }

    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || "Failed to resend code.";
    return { message };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Resend OTP error:", error.message);
    return { message: error.message || "Failed to resend code." };
  }
}

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
      if (response.status === 403) {
        redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
      }

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
  values?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function register(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const values = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    password: (formData.get("password") as string) ?? "",
    confirmPassword: (formData.get("confirmPassword") as string) ?? "",
  };

  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields.",
      values,
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
      return {
        message: friendlyMessage,
        values,
      };
    }
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Registration error:", error.message);
    return {
      message: error.message || "Failed to register.",
      values,
    };
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
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
