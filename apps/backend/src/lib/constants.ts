export const MAX_OTP_ATTEMPTS = 5;

export const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET environment variable is not set");

export const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey)
  throw new Error("RESEND_API_KEY environment variable is not set");

export const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "noreply@example.com";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  path: "/",
};

export const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3002";

export const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (!googleClientId)
  throw new Error("GOOGLE_CLIENT_ID environment variable is not set");

export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientSecret)
  throw new Error("GOOGLE_CLIENT_SECRET environment variable is not set");

export const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("SESSION_SECRET environment variable is not set");
