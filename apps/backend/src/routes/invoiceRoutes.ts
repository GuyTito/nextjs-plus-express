import express from "express";
import {
  fetchCardData,
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchLatestInvoices,
} from "../controllers/invoiceControllers";

const router: express.Router = express.Router();
router.get("/latest", fetchLatestInvoices);
router.get("/card-data", fetchCardData);
router.get("/filtered", fetchFilteredInvoices);
router.get("/pages", fetchInvoicesPages);

export default router;
