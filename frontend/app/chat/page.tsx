"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/lib/toast-context";
import { Conversation } from "@/lib/types";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast, showError } = useToast();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data, error } = await ApiClient.getConversations(50, 0);
        if (error) {
          showError(error);
        } else {
          const response = data as any;
          setConversations(response.results || []);
        }
      } catch (err) {
        addToast("Failed to load conversations", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [addToast, showError]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No conversations yet. Start by liking someone!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const lastMessagePreview =
                conversation.last_message?.body?.substring(0, 50) || "No messages yet";
              const hasUnread = conversation.unread_count > 0;
              const profilePhoto = conversation.profile.pictures?.find((p) => p.is_primary);

              return (
                <Link
                  key={conversation.connection_id}
                  href={`/chat/${conversation.connection_id}`}
                >
                  <div
                    className={`p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      hasUnread ? "bg-rose-50 border-rose-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {profilePhoto ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={profilePhoto.image_url}
                            alt={conversation.profile.first_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {conversation.profile.first_name}
                          </h3>
                          {hasUnread && (
                            <span className="text-xs font-bold ml-2 bg-rose-600 text-white px-2 py-1 rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{lastMessagePreview}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
