import express, { type Router } from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  verifyOTP,
  resendOTP,
  googleAuthCallback,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { VerifyOtpSchema, ResendOtpSchema } from "shared";
import passport from "passport";
const router: Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", validateRequest(VerifyOtpSchema), verifyOTP);
router.post("/resend-otp", validateRequest(ResendOtpSchema), resendOTP);
router.get("/me", authMiddleware, getMe);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
  googleAuthCallback,
);

export default router;
