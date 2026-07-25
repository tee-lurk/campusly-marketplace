"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-canvas dark:bg-canvas-dark">
      {/* ── 65% HERO IMAGE COLUMN ───────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[65%] flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background Image with Ambient Overlay */}
        <img
          src="/login_hero.png"
          alt="Campusly Study Group"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

        {/* Top Header Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shadow-lg group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Campusly Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
              Campusly
            </span>
          </Link>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 max-w-2xl space-y-6 my-auto pt-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Welcome back to Campusly</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight tracking-tight">
            Unlock shared academic knowledge across campus.
          </h1>

          <p className="text-base lg:text-lg text-slate-300/90 font-normal leading-relaxed">
            Access lecture notes, past exam solutions, and study guides created and verified by top students.
          </p>

          {/* Value Props Pills */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <ShieldCheck size={16} />
              </div>
              <span>Verified Student Badges</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <BookOpen size={16} />
              </div>
              <span>Course-Specific Materials</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Sparkles size={16} />
              </div>
              <span>Instant File Downloads</span>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} Campusly Marketplace Inc.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* ── 35% FORM AREA COLUMN ────────────────────────────────────────── */}
      <div className="w-full lg:w-[35%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 my-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Campusly Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-heading font-bold text-brand-indigo text-lg tracking-tight">
                Campusly
              </span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold font-heading text-text-primary dark:text-gray-100 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Enter your university credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-semibold text-text-primary dark:text-gray-200">
                  Password
                </label>
                <button type="button" className="text-xs text-brand-indigo font-medium hover:underline">
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
                  className="w-full rounded-xl border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-3.5 leading-relaxed">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="h-12 text-base font-semibold shadow-md shadow-brand-indigo/20 mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="pt-4 border-t border-border-soft dark:border-border-dark text-center">
            <p className="text-sm text-text-muted">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-brand-indigo font-bold hover:underline inline-flex items-center gap-1">
                Create Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
