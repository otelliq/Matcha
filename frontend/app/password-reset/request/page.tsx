"use client";

import { useState } from "react";
import { useToast } from "@/lib/toast-context";
import { ApiClient } from "@/lib/api-client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await ApiClient.requestPasswordReset(email);
      if (error) {
        showError(error);
      } else {
        setIsSubmitted(true);
        addToast("Password reset email sent!", "success");
      }
    } catch (err) {
      addToast("Request failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-8">
          If an account exists for <strong>{email}</strong>, we've sent a password reset link. Please check your email.
        </p>
        <Link href="/login">
          <Button variant="secondary">Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        <Link href="/login" className="text-rose-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
