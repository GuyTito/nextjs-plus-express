export const MAX_OTP_ATTEMPTS = 5;

export const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET environment variable is not set");

export const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY environment variable is not set");

export const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  path: "/",
};
