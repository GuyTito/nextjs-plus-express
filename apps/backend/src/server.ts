import "dotenv/config";

import express, { type Response, type Request } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import revenueRoutes from "./routes/revenueRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import customerRoutes from "./routes/customerRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import cookieParser from "cookie-parser";
import { runMigrations } from "./migrate";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  googleClientId,
  googleClientSecret,
} from "./lib/constants";

export const port = process.env.SERVER_PORT || process.env.PORT || "4000";
if (!process.env.SERVER_PORT && !process.env.PORT) {
  console.warn("SERVER_PORT or PORT not set, defaulting to 4000");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId!,
      clientSecret: googleClientSecret!,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      (req as any).googleProfile = profile;
      return done(null, { id: profile.id } as any);
    },
  ),
);

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
app.use(passport.initialize());

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
async function startServer() {
  if (process.env.RUN_MIGRATIONS !== "false") {
    try {
      await runMigrations();
    } catch (error) {
      console.error("Failed to run migrations:", error);
      process.exit(1);
    }
  }

  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
}

startServer();
