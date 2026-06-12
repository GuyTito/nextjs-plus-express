import express from "express";
import {
  fetchCardData,
  fetchLatestInvoices,
} from "../controllers/invoiceControllers";

const router: express.Router = express.Router();
router.get("/latest", fetchLatestInvoices);
router.get("/card-data", fetchCardData);

export default router;
