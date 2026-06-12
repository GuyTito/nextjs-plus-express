import express from "express";
import { fetchRevenue } from "../controllers/revenueControllers";

const router: express.Router = express.Router();
router.get("/", fetchRevenue);

export default router;
