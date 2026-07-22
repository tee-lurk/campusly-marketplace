"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required.");
    if (!password) return setError("Password is required.");
    setLoading(true);
    try {
      const user = await login(email, password);
      setLoading(false);
      if (user) {
        if (user.role === "admin") {
          router.push("/admin/overview");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-brand-indigo flex items-center justify-center">
          <BookOpen size={18} className="text-white" />
        </div>
        <span className="font-heading font-bold text-brand-indigo text-xl tracking-tight">
          Campusly
        </span>
      </Link>

      {/* Card */}
      <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl shadow-card p-8 w-full max-w-sm animate-slide-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-text-muted">
            Sign in to access your account and purchases.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="login-email"
            label="University Email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && !email ? "Email is required" : undefined}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-text-primary dark:text-gray-200">
                Password
              </label>
              <button type="button" className="text-xs text-brand-indigo hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-btn border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-indigo font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <p className="text-xs text-text-muted mt-6 text-center">
        Use a registered account or create a new one using the Sign up link.
      </p>
    </div>
  );
}
