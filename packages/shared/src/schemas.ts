import * as z from "zod";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    error: "Please select an invoice status.",
  }),
  date: z.string(),
});

export const InvoiceSchema = FormSchema.omit({ id: true, date: true });
