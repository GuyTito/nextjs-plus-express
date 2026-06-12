import "dotenv/config";

import express, { type Response, type Request } from "express";
import cors from "cors";
import revenueRoutes from "./routes/revenueRoutes";

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json()); // handles json sent thru body
app.use(express.urlencoded({ extended: true })); // handles forms data from browser

// Routes
// app.use("/api/auth", authRoutes);
app.use("/api/revenue", revenueRoutes);

app.get("/api/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello World! heyyy" });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
