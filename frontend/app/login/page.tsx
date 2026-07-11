"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { addToast, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await login(email, password);
      addToast("Login successful!", "success");
      router.push("/browse");
    } catch (err: any) {
      if (err?.fields) {
        setErrors(err.fields);
      } else if (err?.message) {
        showError(err);
      } else {
        addToast("Login failed. Please try again.", "error");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email?.[0]}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password?.[0]}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Login
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-rose-600 hover:underline">
          Register here
        </Link>
      </p>

      <p className="text-center text-gray-600 mt-4">
        <Link href="/password-reset/request" className="text-rose-600 hover:underline">
          Forgot your password?
        </Link>
      </p>
    </div>
  );
}
