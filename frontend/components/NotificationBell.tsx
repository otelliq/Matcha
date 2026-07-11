"use client";

import { useState, useEffect } from "react";
import { useNotificationSocket } from "@/lib/websocket";
import { ApiClient } from "@/lib/api-client";
import { Notification, UnreadCountResponse } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const { isConnected, notifications } = useNotificationSocket();
  const { addToast } = useToast();

  // Load initial unread count
  useEffect(() => {
    const loadCount = async () => {
      const { data, error } = await ApiClient.getUnreadCount();
      if (!error && data) {
        setUnreadCount((data as UnreadCountResponse).unread_count);
      }
    };
    loadCount();
  }, []);

  // Load notifications list
  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await ApiClient.getNotifications(20, 0);
      if (!error && data) {
        setNotificationsList((data as any).results || []);
      }
    };
    loadNotifications();
  }, []);

  // Handle new real-time notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      setUnreadCount((prev) => prev + 1);
      setNotificationsList((prev) => [latestNotification, ...prev]);

      // Show toast for certain notification types
      if (
        ["profile_liked", "mutual_like", "message_received"].includes(
          latestNotification.kind
        )
      ) {
        const messages = {
          profile_liked: `${latestNotification.actor_username} liked your profile`,
          mutual_like: `You matched with ${latestNotification.actor_username}!`,
          message_received: `New message from ${latestNotification.actor_username}`,
        };
        addToast(
          messages[latestNotification.kind as keyof typeof messages] ||
            "New notification",
          "info"
        );
      }
    }
  }, [notifications, addToast]);

  const handleMarkRead = async (notificationId: number) => {
    const { error } = await ApiClient.markNotificationRead(notificationId);
    if (!error) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const { error } = await ApiClient.markAllNotificationsRead();
    if (!error) {
      setUnreadCount(0);
      setNotificationsList((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-700 hover:text-gray-900"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-rose-600 hover:text-rose-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificationsList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications yet</div>
            ) : (
              notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notification.read_at ? "bg-rose-50" : ""
                  }`}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        <strong>{notification.actor_username}</strong>{" "}
                        {notification.kind.replace("_", " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
