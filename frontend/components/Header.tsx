"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./Button";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-rose-600">
          Matcha
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <Link href="/browse" className="text-gray-700 hover:text-gray-900">
                Browse
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-gray-900">
                Search
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-gray-900">
                Chat
              </Link>
              <Link href="/profile/me" className="text-gray-700 hover:text-gray-900">
                Profile
              </Link>
            </div>

            <NotificationBell />

            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
