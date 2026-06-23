import "dotenv/config";

import express, { type Response, type Request } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import revenueRoutes from "./routes/revenueRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import customerRoutes from "./routes/customerRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import cookieParser from "cookie-parser";

export const port = process.env.SERVER_PORT;
if (!port) throw new Error("SERVER_PORT is not set");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json()); // handles json sent thru body
app.use(express.urlencoded({ extended: true })); // handles forms data from browser

// Routes
app.use("/api/auth", authRoutes);

app.use(authMiddleware);
app.use("/api/revenue", revenueRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);

app.get("/api/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello World! heyyy" });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
