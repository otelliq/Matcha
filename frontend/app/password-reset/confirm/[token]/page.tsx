"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { ApiClient } from "@/lib/api-client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function PasswordResetConfirmPage() {
  const params = useParams();
  const token = params.token as string;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast, showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ password: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await ApiClient.confirmPasswordReset(token, password);
      if (error) {
        showError(error);
      } else {
        setIsSuccess(true);
        addToast("Password reset successfully!", "success");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      addToast("Reset failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Complete</h1>
        <p className="text-gray-600 mb-8">Your password has been reset successfully. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Set New Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Reset Password
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
