"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "./types";
import { ApiClient } from "./api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if there's an access token in sessionStorage or try to refresh
        const token = sessionStorage.getItem("access_token");
        if (token) {
          ApiClient.setAccessToken(token);
          const { data, error: apiError } = await ApiClient.getMe();
          if (!apiError && data) {
            setUser(data as User);
          } else {
            // Token invalid, try to refresh
            const refreshed = await ApiClient.refreshToken();
            if (refreshed) {
              const token = ApiClient.getAccessToken();
              if (token) {
                sessionStorage.setItem("access_token", token);
                const { data, error } = await ApiClient.getMe();
                if (!error && data) {
                  setUser(data as User);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await ApiClient.login({ email, password });
      if (apiError) {
        setError(apiError.message);
        throw new Error(apiError.message);
      }

      const response = data as { access: string; refresh: string };
      ApiClient.setAccessToken(response.access);
      sessionStorage.setItem("access_token", response.access);

      // Refresh token is set in httpOnly cookie by the proxy endpoint
      // Get user profile
      const { data: userData, error: userError } = await ApiClient.getMe();
      if (userError) {
        setError(userError.message);
        throw new Error(userError.message);
      }

      setUser(userData as User);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      password: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: response, error: apiError } = await ApiClient.register(data);
        if (apiError) {
          setError(apiError.message);
          throw new Error(apiError.message);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const refreshToken = sessionStorage.getItem("refresh_token") || "";
      await ApiClient.logout(refreshToken);
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      ApiClient.setAccessToken(null);
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data, error: apiError } = await ApiClient.getMe();
      if (!apiError && data) {
        setUser(data as User);
      }
    } catch (err) {
      console.error("Refresh user failed:", err);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
