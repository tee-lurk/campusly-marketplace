"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff } from "lucide-react";
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
            Create your account
          </h1>
          <p className="text-sm text-text-muted">
            Join thousands of students sharing academic materials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="reg-name"
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <Input
            id="reg-username"
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
          />
          <Input
            id="reg-email"
            label="University Email"
            type="email"
            placeholder="you@university.edu.et"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint="Use your university-issued email address."
            required
          />
          <div className="relative">
            <Input
              id="reg-password"
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-[38px] text-text-muted hover:text-text-body transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            id="reg-confirm"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            required
          />

          {errors.submit && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
              {errors.submit}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-center text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-indigo font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

