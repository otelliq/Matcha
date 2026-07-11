"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useChatSocket } from "@/lib/websocket";
import { useToast } from "@/lib/toast-context";
import { Message } from "@/lib/types";
import { Button } from "@/components/Button";

export default function ChatDetailPage() {
  const params = useParams();
  const connectionId = Number(params.connectionId);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast, showError } = useToast();
  const { send, error: wsError, messages: wsMessages } = useChatSocket(connectionId);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, wsMessages]);

  // Load initial message history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await ApiClient.getMessages(connectionId, 50, 0);
        if (error) {
          showError(error);
        } else {
          const response = data as any;
          setMessages(response.results || []);
          // Mark as read
          await ApiClient.markMessagesRead(connectionId);
        }

        // Get connection details
        const { data: connData, error: connError } = await ApiClient.getConnections(100, 0);
        if (!connError && connData) {
          const response = connData as any;
          const conn = response.results?.find((c: any) => c.id === connectionId);
          if (conn) setProfile(conn.profile);
        }
      } catch (err) {
        addToast("Failed to load messages", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [connectionId, addToast, showError]);

  // Add WebSocket messages to the list
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages((prev) => [...prev, wsMessages[wsMessages.length - 1]]);
    }
  }, [wsMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      send({ body: newMessage });
      setNewMessage("");
    } catch (err) {
      addToast("Failed to send message", "error");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (wsError === "This connection has ended") {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Ended</h1>
          <p className="text-gray-600 mb-8">This connection has been closed.</p>
          <Button onClick={() => router.push("/chat")}>Back to Conversations</Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.first_name || "Chat"}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_username === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_username === "you"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.body}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
