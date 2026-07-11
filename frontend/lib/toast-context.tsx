"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/types";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;
  showError: (error: ApiError) => void;
}

import { createContext, useContext } from "react";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info", duration = 5000) => {
      const id = Date.now().toString();
      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const showError = useCallback(
    (error: ApiError) => {
      addToast(error.message, "error");
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showError }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
