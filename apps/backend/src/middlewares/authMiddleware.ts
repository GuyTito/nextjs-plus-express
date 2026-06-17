import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sql } from "../lib/db";
import { type User } from "shared";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.cookie) {
    token = req.headers.cookie.split("jwt=")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key";
    const decoded = jwt.verify(token, secretKey) as { userId: string };
    // check if user exists in DB by decoded.userId if needed
    const userArray = await sql<
      User[]
    >`SELECT * FROM users WHERE id=${decoded.userId}`;
    const user = userArray[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    // console.error("JWT verification failed:", err);
    // res.clearCookie("jwt", {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    // });
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
