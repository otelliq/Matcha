"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;
  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const { error } = await ApiClient.verifyEmail(token);
        if (error) {
          setState("error");
          addToast(error.message || "Verification link has expired", "error");
        } else {
          setState("success");
          addToast("Email verified successfully!", "success");
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch (err) {
        setState("error");
        addToast("Verification failed", "error");
      }
    };

    verify();
  }, [token, addToast, router]);

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      {state === "verifying" && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying...</h1>
          <p className="text-gray-600">Please wait while we verify your email.</p>
        </>
      )}

      {state === "success" && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">✓ Email Verified</h1>
          <p className="text-gray-600 mb-8">Your email has been successfully verified. Redirecting to login...</p>
        </>
      )}

      {state === "error" && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
          <p className="text-gray-600 mb-8">The verification link has expired or is invalid.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button>Register Again</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Back to Login</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
