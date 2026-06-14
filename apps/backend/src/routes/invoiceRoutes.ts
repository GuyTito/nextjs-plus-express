import express from "express";
import {
  createInvoice,
  fetchCardData,
  fetchFilteredInvoices,
  fetchInvoiceById,
  fetchInvoicesPages,
  fetchLatestInvoices,
  updateInvoice,
} from "../controllers/invoiceControllers";
import { validateRequest } from "../middlewares/validateRequest";
import { InvoiceSchema } from "shared";

const router: express.Router = express.Router();
router.get("/latest", fetchLatestInvoices);
router.get("/card-data", fetchCardData);
router.get("/pages", fetchInvoicesPages);
router.get("/", fetchFilteredInvoices);
router.get("/:id", fetchInvoiceById);

router.post("/", validateRequest(InvoiceSchema), createInvoice);
router.put("/:id", validateRequest(InvoiceSchema), updateInvoice);

export default router;
