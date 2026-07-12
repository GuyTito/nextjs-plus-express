import { type RequestHandler } from "express";
import { sql } from "../lib/db";
import { type User, type VerificationType, JWT_COOKIE_NAME } from "shared";
import { VerifyOtpSchema, ResendOtpSchema } from "shared";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generateToken";
import { generateOTP } from "../lib/generateOTP";
import { cookieOptions, MAX_OTP_ATTEMPTS } from "../lib/constants";

export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userArray = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
  const user = userArray[0];
  if (!user) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.is_verified) {
    return res.status(403).json({ message: "Please verify your email before logging in." });
  }

  generateToken(user.id, res);

  res.status(200).json({
    message: "User logged in successfully",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

export const logoutUser: RequestHandler = async (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, cookieOptions);
  res.json({ message: "Logged out" });
};

export const getMe: RequestHandler = async (req, res) => {
  res.json({ user: (req as any).user });
};

export const registerUser: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  const existingUserArray = await sql<User[]>
    `SELECT * FROM users WHERE email=${email}`;
  const existingUser = existingUserArray[0];
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserArray = await sql<User[]>`
    INSERT INTO users (name, email, password)
    VALUES (${name}, ${email}, ${hashedPassword})
    RETURNING *
  `;
  const newUser = newUserArray[0];

  let otp: string | undefined;
  try {
    otp = await generateOTP(newUser.id, newUser.email, "EMAIL_VERIFICATION");
  } catch (e) {
    console.error("Failed to generate OTP", e);
  }

  res.status(201).json({
    message: "User registered successfully",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    ...(otp && { otp }),
  });
};

export const verifyOTP: RequestHandler = async (req, res) => {
  const { email, code, type } = req.body as {
    email: string;
    code: string;
    type: VerificationType;
  };

  const userArray = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
  const user = userArray[0];
  if (!user) {
    return res.status(404).json({ message: "Invalid email or code." });
  }

  const tokenArray = await sql`
    SELECT * FROM verification_tokens
    WHERE user_id=${user.id}
      AND type=${type}::verification_type
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const token = tokenArray[0];

  if (!token) {
    await sql`
      DELETE FROM verification_tokens
      WHERE user_id=${user.id} AND type=${type}::verification_type
    `;
    return res.status(400).json({ message: "Invalid or expired code." });
  }

  const match = await bcrypt.compare(code, token.hashed_code);

  if (!match) {
    const next = token.attempts + 1;
    if (next >= MAX_OTP_ATTEMPTS) {
      await sql`DELETE FROM verification_tokens WHERE id=${token.id}`;
      return res
        .status(429)
        .json({ message: "Too many failed attempts. Please request a new code." });
    }
    await sql`UPDATE verification_tokens SET attempts=${next} WHERE id=${token.id}`;
    return res.status(401).json({
      message: "Invalid code.",
      attemptsRemaining: MAX_OTP_ATTEMPTS - next,
    });
  }

  await sql.begin(async (sql) => {
    await sql`UPDATE users SET is_verified = true WHERE id=${user.id}`;
    await sql`DELETE FROM verification_tokens WHERE id=${token.id}`;
  });

  return res.status(200).json({
    message: "Email verified successfully",
    user: { id: user.id, name: user.name, email: user.email, is_verified: true },
  });
};

export const resendOTP: RequestHandler = async (req, res) => {
  const { email, type } = req.body as {
    email: string;
    type: VerificationType;
  };

  const userArray = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
  const user = userArray[0];
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (type === "EMAIL_VERIFICATION" && user.is_verified) {
    return res.status(400).json({ message: "Email already verified." });
  }

  await sql`
    DELETE FROM verification_tokens
    WHERE user_id=${user.id} AND type=${type}::verification_type
  `;

  let otp: string | undefined;
  try {
    otp = await generateOTP(user.id, user.email, type);
  } catch (e) {
    console.error("Failed to generate OTP", e);
  }

  return res.status(200).json({
    message: "Verification code sent.",
    ...(otp && { otp }),
  });
};
