import AuthPageShell from "@/app/ui/auth-page-shell";
import VerifyOtpForm from "@/app/ui/verify-otp-form";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Verify Email",
};

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; type?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;
  const type = params.type || "EMAIL_VERIFICATION";

  if (!email) {
    redirect("/register");
  }

  return (
    <AuthPageShell>
      <Suspense>
        <VerifyOtpForm email={email} type={type} />
      </Suspense>
    </AuthPageShell>
  );
}
