"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapBackendUserToFrontend(backendUser: any): User {
  return {
    id: backendUser.user_id || backendUser.id,
    name: backendUser.name,
    username: backendUser.username,
    email: backendUser.user?.email || "",
    bio: backendUser.bio || "",
    avatar: backendUser.avatar_url || "/default-avatar.svg",
    role: backendUser.user?.role === "admin" ? "admin" : "student",
    isVerified: backendUser.is_verified || false,
    memberSince: backendUser.user?.created_at
      ? new Date(backendUser.user.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (token: string): Promise<User | null> => {
    try {
      const res = await fetch("http://localhost:3002/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return mapBackendUserToFrontend(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
    return null;
  };

  const tryRefresh = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("campusly_refresh_token");
    if (!refreshToken) return false;

    try {
      const res = await fetch("http://localhost:3002/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("campusly_access_token", data.access_token);
        localStorage.setItem("campusly_refresh_token", data.refresh_token);
        const profile = await fetchProfile(data.access_token);
        if (profile) {
          setUser(profile);
          return true;
        }
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
    return false;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("campusly_access_token");
      if (token) {
        const profile = await fetchProfile(token);
        if (profile) {
          setUser(profile);
        } else {
          const refreshed = await tryRefresh();
          if (!refreshed) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3002/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid email or password.");
      }

      const data = await res.json();
      localStorage.setItem("campusly_access_token", data.access_token);
      localStorage.setItem("campusly_refresh_token", data.refresh_token);

      const profile = await fetchProfile(data.access_token);
      if (profile) {
        setUser(profile);
        setIsLoading(false);
        return profile;
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
    return null;
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3002/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create account.");
      }

      const data = await res.json();
      localStorage.setItem("campusly_access_token", data.access_token);
      localStorage.setItem("campusly_refresh_token", data.refresh_token);

      const profile = await fetchProfile(data.access_token);
      if (profile) {
        setUser(profile);
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campusly_access_token");
    localStorage.removeItem("campusly_refresh_token");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

