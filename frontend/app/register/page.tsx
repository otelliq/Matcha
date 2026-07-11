"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const { addToast, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ password: "Passwords do not match" });
      return;
    }

    try {
      await register({
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      setIsVerifying(true);
    } catch (err: any) {
      if (err?.fields) {
        setErrors(err.fields);
      } else if (err?.message) {
        showError(err);
      } else {
        addToast("Registration failed. Please try again.", "error");
      }
    }
  };

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-8">
          We've sent a verification link to <strong>{email}</strong>. Please check your email and click the link to verify your account.
        </p>
        <Link href="/login">
          <Button variant="secondary">Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Create Account</h1>

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
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username?.[0]}
          required
        />

        <Input
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.first_name?.[0]}
          required
        />

        <Input
          label="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.last_name?.[0]}
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

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword?.[0]}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Register
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-rose-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
