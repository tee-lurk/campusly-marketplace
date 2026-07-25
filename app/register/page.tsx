"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
  submit?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Full name is required.";
    
    if (!username.trim()) {
      errs.username = "Username is required.";
    } else if (username.length < 3) {
      errs.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errs.username = "Username can only contain letters, numbers, and underscores.";
    }

    if (!email) {
      errs.email = "University email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    
    if (password !== confirm) {
      errs.confirm = "Passwords do not match.";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const ok = await register(name, username.trim().toLowerCase(), email, password);
      setLoading(false);
      if (ok) {
        router.push("/dashboard/listings");
      }
    } catch (err: any) {
      setLoading(false);
      setErrors({ submit: err.message || "Failed to create account." });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-canvas dark:bg-canvas-dark">
      {/* ── 65% HERO IMAGE COLUMN ───────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[65%] flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background Image with Ambient Overlay */}
        <img
          src="/register_hero.png"
          alt="Campusly Student Community"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-slate-950/60 to-slate-950/20" />
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
            <UserPlus size={14} className="text-emerald-400" />
            <span>Join the Student Marketplace</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight tracking-tight">
            Turn your study notes into income &amp; excel in your exams.
          </h1>

          <p className="text-base lg:text-lg text-slate-300/90 font-normal leading-relaxed">
            Create an account to browse thousands of verified lecture modules or start selling your own academic materials today.
          </p>

          {/* Value Props Pills */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Sparkles size={16} />
              </div>
              <span>Monetize Course Notes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <ShieldCheck size={16} />
              </div>
              <span>Student ID Verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <BookOpen size={16} />
              </div>
              <span>100% Peer Peer Exchange</span>
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
      <div className="w-full lg:w-[35%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 my-auto overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Campusly Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-heading font-bold text-brand-indigo text-lg tracking-tight">
                Campusly
              </span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold font-heading text-text-primary dark:text-gray-100 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-text-muted mt-1.5">
              Fill in your details to join your university community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reg-name"
              label="Full Name *"
              placeholder="e.g. Temesgen Nigu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              id="reg-username"
              label="Username *"
              placeholder="e.g. temesgen_n"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              required
            />

            <Input
              id="reg-email"
              label="University Email *"
              type="email"
              placeholder="you@university.edu.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-text-primary dark:text-gray-200">
                Password *
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo transition-all shadow-sm"
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
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-sm font-semibold text-text-primary dark:text-gray-200">
                Confirm Password *
              </label>
              <input
                id="reg-confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-xl border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo transition-all shadow-sm"
              />
              {errors.confirm && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirm}</p>
              )}
            </div>

            {errors.submit && (
              <div className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-3.5 leading-relaxed">
                {errors.submit}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="h-12 text-base font-semibold shadow-md shadow-brand-indigo/20 mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="pt-3 border-t border-border-soft dark:border-border-dark text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-indigo font-bold hover:underline inline-flex items-center gap-1">
                Sign In <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
