import express, { type Router } from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  verifyOTP,
  resendOTP,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { VerifyOtpSchema, ResendOtpSchema } from "shared";
const router: Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", validateRequest(VerifyOtpSchema), verifyOTP);
router.post("/resend-otp", validateRequest(ResendOtpSchema), resendOTP);
router.get("/me", authMiddleware, getMe);

export default router;
