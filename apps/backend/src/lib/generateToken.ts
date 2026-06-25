import type { Response } from "express";
import jwt from "jsonwebtoken";
import { cookieOptions, secretKey } from "./constants";
import { JWT_COOKIE_NAME, COOKIE_MAX_AGE_MS } from "shared";

export const generateToken = (userId: string, res: Response): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const options = { expiresIn } as jwt.SignOptions;

  const token = jwt.sign({ userId }, secretKey!, options);

  res.cookie(JWT_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE_MS,
  });

  return token;
};
