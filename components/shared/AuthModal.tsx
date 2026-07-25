"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfter?: string;
}

export function AuthModal({ isOpen, onClose, redirectAfter }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await login(email, password);
      setLoading(false);
      if (ok) {
        onClose();
        if (redirectAfter) router.push(redirectAfter);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Invalid credentials.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-1 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <img src="/logo.png" alt="Campusly Logo" className="w-6 h-6 rounded-md object-contain" />
          <span className="font-heading font-bold text-brand-indigo text-lg">Campusly</span>
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary dark:text-gray-100">
          {tab === "login" ? "Sign in to continue" : "Join Campusly"}
        </h2>
        <p className="text-sm text-text-muted text-center">
          {tab === "login"
             ? "You need an account to purchase materials."
             : "Create a free account to buy and sell academic materials."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-btn border border-border-soft dark:border-border-dark mb-5 overflow-hidden">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "login"
              ? "bg-brand-indigo text-white"
              : "text-text-muted hover:text-text-body"
          }`}
          onClick={() => setTab("login")}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "register"
              ? "bg-brand-indigo text-white"
              : "text-text-muted hover:text-text-body"
          }`}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@university.edu.et"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
          <p className="text-xs text-center text-text-muted">
            Use your registered email and password to sign in.
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted text-center">
            Register with your university email to get started.
          </p>
          <Button
            fullWidth
            onClick={() => {
              onClose();
              router.push("/register");
            }}
          >
            Create Account
          </Button>
        </div>
      )}
    </Modal>
  );
}
