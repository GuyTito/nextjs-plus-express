import AuthPageShell from "@/app/ui/auth-page-shell";
import RegisterForm from "@/app/ui/register-form";
import { Suspense } from "react";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}
