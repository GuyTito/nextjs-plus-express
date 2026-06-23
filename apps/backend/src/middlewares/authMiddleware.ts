import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sql } from "../lib/db";
import { type User } from "shared";
import { secretKey } from "../lib/constants";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt; // correctly parsed, no manual splitting
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey!) as { userId: string };
    // check if user exists in DB by decoded.userId if needed
    const userArray = await sql<
      User[]
    >`SELECT * FROM users WHERE id=${decoded.userId}`;
    const user = userArray[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
