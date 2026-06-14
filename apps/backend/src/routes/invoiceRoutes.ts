import express from "express";
import {
  createInvoice,
  fetchCardData,
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchLatestInvoices,
} from "../controllers/invoiceControllers";
import { validateRequest } from "../middlewares/validateRequest";
import { InvoiceSchema } from "shared";

const router: express.Router = express.Router();
router.get("/latest", fetchLatestInvoices);
router.get("/card-data", fetchCardData);
router.get("/pages", fetchInvoicesPages);
router.get("/", fetchFilteredInvoices);

router.post("/", validateRequest(InvoiceSchema), createInvoice);

export default router;
