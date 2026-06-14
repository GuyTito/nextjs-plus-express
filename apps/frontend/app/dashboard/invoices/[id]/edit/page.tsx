import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;

  const invoice = await fetchInvoiceById(id);

  if (!invoice) {
    return {
      title: "Invoice not found",
      description: "The requested invoice could not be found.",
    };
  }

  const customers = await fetchCustomers();
  const customer = customers.find(
    (c) => String(c.id) === String(invoice.customer_id),
  );
  const customerName = customer?.name ?? "Unknown customer";

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(invoice.amount ?? 0);

  const title = `Invoice #${invoice.id.slice(-4)} — ${invoice.status}`;
  const description = `Invoice ${invoice.id} for ${customerName}. Amount: ${amount}. Status: ${invoice.status}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/hero-desktop.png"],
    },
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
