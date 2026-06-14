import express from "express";
import { fetchCustomers } from "../controllers/customerControllers";

const router: express.Router = express.Router();
router.get("/", fetchCustomers);

export default router;
