import { ApiErrorResponse, ApiError } from "./types";

let accessToken: string | null = null;

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  private static getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return sessionStorage.getItem("refresh_token");
  }

  static setAccessToken(token: string | null) {
    accessToken = token;
  }

  static getAccessToken() {
    return accessToken;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(typeof options.headers === "object" && options.headers ? options.headers as Record<string, string> : {}),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies (for httpOnly refresh token)
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          headers["Authorization"] = `Bearer ${accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
          });
        }
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        return { error: errorData.error };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as unknown as T };
      }

      const data: T = await response.json();
      return { data };
    } catch (err) {
      console.error("API request failed:", err);
      return {
        error: {
          code: "NETWORK_ERROR",
          message: err instanceof Error ? err.message : "Network error",
        },
      };
    }
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const refresh = this.getStoredRefreshToken();
      if (!refresh) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      const access = payload?.access as string | undefined;
      const nextRefresh = payload?.refresh as string | undefined;

      if (!access) {
        return false;
      }

      this.setAccessToken(access);

      if (nextRefresh && typeof window !== "undefined") {
        sessionStorage.setItem("refresh_token", nextRefresh);
      }

      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return false;
    }
  }

  // Auth endpoints
  static async register(data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    return this.request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async login(data: { email: string; password: string }) {
    return this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async logout(refreshToken: string) {
    return this.request("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  static async verifyEmail(token: string) {
    return this.request(`/auth/verify-email/${token}/`, {
      method: "GET",
    });
  }

  static async requestPasswordReset(email: string) {
    return this.request("/auth/password-reset/request/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  static async confirmPasswordReset(token: string, password: string) {
    return this.request("/auth/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // Profile endpoints
  static async getMe() {
    return this.request("/profiles/me/");
  }

  static async updateProfile(data: Partial<any>) {
    return this.request("/profiles/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async getProfile(id: number) {
    return this.request(`/profiles/${id}/`);
  }

  static async getViewers(limit = 20, offset = 0) {
    return this.request(`/profiles/me/viewers/?limit=${limit}&offset=${offset}`);
  }

  static async getLikers(limit = 20, offset = 0) {
    return this.request(`/profiles/me/likers/?limit=${limit}&offset=${offset}`);
  }

  static async updateLocation(data: {
    latitude?: number;
    longitude?: number;
    city?: string;
    neighborhood?: string;
  }) {
    return this.request("/profiles/me/location/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Photo endpoints
  static async uploadPhoto(file: File, isPrimary?: boolean) {
    const formData = new FormData();
    formData.append("image", file);
    if (isPrimary !== undefined) {
      formData.append("is_primary", isPrimary.toString());
    }

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/profiles/me/photos/`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        return { error: errorData.error };
      }

      const data = await response.json();
      return { data };
    } catch (err) {
      return {
        error: {
          code: "UPLOAD_ERROR",
          message: err instanceof Error ? err.message : "Upload failed",
        },
      };
    }
  }

  static async deletePhoto(photoId: number) {
    return this.request(`/profiles/me/photos/${photoId}/`, {
      method: "DELETE",
    });
  }

  // Tags
  static async getTags(q?: string, limit = 20, offset = 0) {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    return this.request(`/tags/?${params.toString()}`);
  }

  // Matching
  static async getSuggestions(params?: Record<string, any>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v));
          } else {
            query.append(key, String(value));
          }
        }
      });
    }
    return this.request(`/matching/suggestions/?${query.toString()}`);
  }

  static async search(params?: Record<string, any>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v));
          } else {
            query.append(key, String(value));
          }
        }
      });
    }
    return this.request(`/matching/search/?${query.toString()}`);
  }

  // Interactions
  static async like(userId: number) {
    return this.request(`/interactions/likes/${userId}/`, {
      method: "POST",
    });
  }

  static async unlike(userId: number) {
    return this.request(`/interactions/likes/${userId}/`, {
      method: "DELETE",
    });
  }

  static async block(userId: number) {
    return this.request(`/interactions/blocks/${userId}/`, {
      method: "POST",
    });
  }

  static async unblock(userId: number) {
    return this.request(`/interactions/blocks/${userId}/`, {
      method: "DELETE",
    });
  }

  static async report(userId: number, reason: string, details?: string) {
    return this.request(`/interactions/reports/${userId}/`, {
      method: "POST",
      body: JSON.stringify({ reason, details }),
    });
  }

  static async getConnections(limit = 20, offset = 0) {
    return this.request(`/interactions/connections/?limit=${limit}&offset=${offset}`);
  }

  // Chat
  static async getConversations(limit = 20, offset = 0) {
    return this.request(`/chat/conversations/?limit=${limit}&offset=${offset}`);
  }

  static async getMessages(connectionId: number, limit = 50, offset = 0) {
    return this.request(`/chat/${connectionId}/messages/?limit=${limit}&offset=${offset}`);
  }

  static async sendMessage(connectionId: number, body: string) {
    return this.request(`/chat/${connectionId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  static async markMessagesRead(connectionId: number) {
    return this.request(`/chat/${connectionId}/messages/mark-read/`, {
      method: "POST",
    });
  }

  // Notifications
  static async getNotifications(limit = 20, offset = 0) {
    return this.request(`/notifications/?limit=${limit}&offset=${offset}`);
  }

  static async getUnreadCount() {
    return this.request("/notifications/unread-count/");
  }

  static async markNotificationRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/mark-read/`, {
      method: "POST",
    });
  }

  static async markAllNotificationsRead() {
    return this.request("/notifications/mark-all-read/", {
      method: "POST",
    });
  }
}
