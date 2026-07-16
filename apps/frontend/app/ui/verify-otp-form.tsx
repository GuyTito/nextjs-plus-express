"use client";

import { lusitana } from "@/app/ui/fonts";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { useActionState } from "react";
import { verifyOtp, resendOtp, VerifyOtpState, ResendOtpState } from "@/app/lib/actions";

const verifyInitialState: VerifyOtpState = { message: null };
const resendInitialState: ResendOtpState = { message: null };

export default function VerifyOtpForm({
  email,
  type,
}: {
  email: string;
  type: string;
}) {
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtp,
    verifyInitialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendOtp,
    resendInitialState,
  );

  return (
    <>
      <form action={verifyAction} className="space-y-3">
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Verify your email
          </h1>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to {email}
          </p>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="type" value={type} />
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="code"
            >
              Verification code
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-200 py-2.25 text-sm outline-2 placeholder:text-gray-500"
              id="code"
              type="text"
              name="code"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="000000"
              aria-describedby="code-error"
              required
            />
          </div>
          <Button className="mt-4 w-full" aria-disabled={verifyPending}>
            Verify email
          </Button>
          <div
            id="code-error"
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {verifyState?.message && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{verifyState.message}</p>
              </>
            )}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Already verified?{" "}
            <a href="/login" className="font-medium text-blue-600 underline">
              Log in
            </a>
          </div>
        </div>
      </form>
      <form action={resendAction} className="px-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="type" value={type} />
        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          aria-disabled={resendPending}
        >
          Resend code
        </Button>
        {resendState?.message && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {resendState.message}
          </p>
        )}
        <p className="mt-1 text-center text-xs text-gray-500">
          Rate limiting is not yet implemented.
        </p>
      </form>
    </>
  );
}
