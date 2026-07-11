"use client";

import { useToast } from "@/lib/toast-context";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg pointer-events-auto max-w-sm ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
