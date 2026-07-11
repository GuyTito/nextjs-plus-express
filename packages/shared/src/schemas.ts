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

const RegisterFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Please enter your name." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const RegisterSchema = RegisterFormSchema;
