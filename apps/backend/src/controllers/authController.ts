import { type RequestHandler } from "express";
import { sql } from "../lib/db";
import { type User, JWT_COOKIE_NAME } from "shared";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generateToken";
import { cookieOptions } from "../lib/constants";

export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // check if user exists in DB by email
  const userArray = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
  const user = userArray[0];
  if (!user) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  // compare password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  generateToken(user.id, res);

  res.status(200).json({
    message: "User logged in successfully",
    user: { id: user.id, name: user.name, email: user.email },
    // token,
  });
};

export const logoutUser: RequestHandler = async (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, cookieOptions);
  res.json({ message: "Logged out" });
};

export const getMe: RequestHandler = async (req, res) => {
  res.json({ user: (req as any).user });
};

// register
export const registerUser: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  // check if user already exists in DB by email
  const existingUserArray = await sql<
    User[]
  >`SELECT * FROM users WHERE email=${email}`;
  const existingUser = existingUserArray[0];
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert new user into DB
  const newUserArray = await sql<User[]>`
    INSERT INTO users (name, email, password)
    VALUES (${name}, ${email}, ${hashedPassword})
    RETURNING *
  `;
  const newUser = newUserArray[0];

  // generateToken(newUser.id, res);

  res.status(201).json({
    message: "User registered successfully",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    // token,
  });
};
