import { cookies } from "next/headers";
import { JWT_COOKIE_NAME } from "shared";

export const API_URL = process.env.API_URL;
if (!API_URL) throw new Error("API_URL is not set");

export async function api(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(JWT_COOKIE_NAME)?.value;

  const res = await fetch(`${API_URL}/${path}`, {
    ...options,
    headers: {
      // ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(jwt ? { Cookie: `${JWT_COOKIE_NAME}=${jwt}` } : {}),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message: string;
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await res.json();
      message = data.message || JSON.stringify(data);
    } else {
      message = await res.text();
    }
    console.error("API error:", message);
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return res.json();
}
