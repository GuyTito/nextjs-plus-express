import express, { type Router } from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);

export default router;
