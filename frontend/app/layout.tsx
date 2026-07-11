import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "Matcha - Dating App",
  description: "Find your perfect match",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
