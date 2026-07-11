"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./auth-context";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (code: number) => void;
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
}: UseWebSocketOptions) {
  const { isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
      if (!token) return;

      const wsUrl = `${url}?access_token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.addEventListener("open", () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      });

      ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      });

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      });

      ws.addEventListener("close", (event) => {
        setIsConnected(false);
        onClose?.(event.code);

        // Reconnect logic with exponential backoff
        if (event.code !== 4401 && event.code !== 4403) {
          // Don't reconnect on auth errors
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        }
      });

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
    }
  }, [isAuthenticated, url, onMessage, onError, onOpen, onClose]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return {
    isConnected,
    send,
    close: () => wsRef.current?.close(),
  };
}

export function useChatSocket(connectionId: number | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((data: any) => {
    if (data.id) {
      // It's a message
      setMessages((prev) => [...prev, data]);
    }
  }, []);

  const handleClose = useCallback((code: number) => {
    if (code === 4403) {
      setError("This connection has ended");
    }
  }, []);

  const ws = useWebSocket({
    url: connectionId
      ? `${process.env.NEXT_PUBLIC_API_URL || "ws://localhost:8000"}/ws/chat/${connectionId}/`
      : "",
    onMessage: handleMessage,
    onClose: handleClose,
  });

  const sendMessage = useCallback(
    (body: string) => {
      ws.send({ body });
    },
    [ws]
  );

  return {
    ...ws,
    messages,
    sendMessage,
    error,
  };
}

export function useNotificationSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleMessage = useCallback((data: any) => {
    if (data.id && data.kind) {
      // It's a notification
      setNotifications((prev) => [data, ...prev]);
    }
  }, []);

  const ws = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_API_URL || "ws://localhost:8000"}/ws/notifications/`,
    onMessage: handleMessage,
  });

  return {
    ...ws,
    notifications,
  };
}
