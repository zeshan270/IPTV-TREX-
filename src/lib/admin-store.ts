"use client";

import { create } from "zustand";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthState {
  token: string | null;
  admin: AdminUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  getToken: () => string | null;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  token: null,
  admin: null,
  isLoggedIn: false,
  isLoading: true,

  getToken: () => {
    const state = get();
    if (state.token) return state.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  },

  login: async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    const token = data.token;

    localStorage.setItem("admin_token", token);
    set({
      token,
      admin: data.user || data.admin || { id: data.userId, email, name: email.split("@")[0], role: "admin" },
      isLoggedIn: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    set({ token: null, admin: null, isLoggedIn: false, isLoading: false });
  },

  checkAuth: async () => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!storedToken) {
      set({ token: null, admin: null, isLoggedIn: false, isLoading: false });
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!res.ok) {
        localStorage.removeItem("admin_token");
        set({ token: null, admin: null, isLoggedIn: false, isLoading: false });
        return;
      }

      const data = await res.json();
      set({
        token: storedToken,
        admin: data.user || data.admin || data,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("admin_token");
      set({ token: null, admin: null, isLoggedIn: false, isLoading: false });
    }
  },
}));

// Helper to get auth headers for API calls
export function adminFetchHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = adminFetchHeaders();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  return res;
}
