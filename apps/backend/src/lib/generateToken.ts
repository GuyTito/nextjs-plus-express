import type { Response } from "express";
import jwt from "jsonwebtoken";
import { cookieOptions, JWT_COOKIE_NAME, secretKey } from "./constants";

export const generateToken = (userId: string, res: Response): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const options = { expiresIn } as jwt.SignOptions;

  const token = jwt.sign({ userId }, secretKey!, options);

  res.cookie(JWT_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
