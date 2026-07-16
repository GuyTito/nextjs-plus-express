import AuthPageShell from "@/app/ui/auth-page-shell";
import LoginForm from "@/app/ui/login-form";
import { Suspense } from "react";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
