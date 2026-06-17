import type { Response } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string, res: Response): string => {
  const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key";

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const options = { expiresIn } as jwt.SignOptions;

  const token = jwt.sign({ userId }, secretKey, options);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
