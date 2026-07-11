"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Matcha</h1>
      <p className="text-xl text-gray-600 mb-8">Find your perfect match today</p>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-lg text-gray-700 mb-8">Ready to discover new connections?</p>
          <div className="flex gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg">Browse Profiles</Button>
            </Link>
            <Link href="/chat">
              <Button variant="secondary" size="lg">
                View Chats
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
