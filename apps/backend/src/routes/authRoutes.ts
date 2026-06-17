import express, { type Router } from "express";
import {
  loginUser,
  // logoutUser,
  // registerUser,
} from "../controllers/authController";
const router: Router = express.Router();

// router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/logout", logoutUser);

export default router;
