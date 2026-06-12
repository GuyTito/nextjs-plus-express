import express from "express";
import { fetchLatestInvoices } from "../controllers/invoiceControllers";

const router: express.Router = express.Router();
router.get("/latest", fetchLatestInvoices);

export default router;
