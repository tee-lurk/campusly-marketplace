"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  User,
  ListChecks,
  ShoppingBag,
  Wallet,
  LogOut,
  MessageSquare,
  Lock,
  Bell,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/listings", label: "My Listings", icon: ListChecks, section: "dashboard" },
  { href: "/dashboard/purchases", label: "My Purchases", icon: ShoppingBag, section: "dashboard" },
  { href: "/dashboard/earnings", label: "My Earnings", icon: Wallet, section: "dashboard" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, section: "dashboard" },
  { href: "/dashboard/profile", label: "Profile Settings", icon: User, tab: "profile", section: "account" },
  { href: "/dashboard/profile?tab=password", label: "Password", icon: Lock, tab: "password", section: "account" },
  { href: "/dashboard/profile?tab=notifications", label: "Notifications", icon: Bell, tab: "notifications", section: "account" },
  { href: "/dashboard/profile?tab=verification", label: "Verification", icon: ShieldCheck, tab: "verification", section: "account" },
];

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Close mobile drawer when pathname or searchParams change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  if (!user) return null;

  // Determine current active item label for mobile top bar
  const activeItem = navItems.find((item) =>
    item.tab
      ? pathname === "/dashboard/profile" && currentTab === item.tab
      : pathname === item.href ||
        (item.href === "/dashboard/listings" && pathname.startsWith("/dashboard/listings"))
  );

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      {/* ── MOBILE HAMBURGER TOP BAR (< lg screens) ──────────────────── */}
      <div className="lg:hidden w-full bg-[#F0F0EC] dark:bg-[#101216] border-b border-[#E5E5E0] dark:border-[#26282E] sticky top-[64px] z-30 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white dark:bg-[#1E2028] border border-[#E5E5E0] dark:border-[#2A2D36] text-[#1A1A18] dark:text-gray-100 shadow-sm active:scale-95 transition-transform"
            aria-label="Open Dashboard Menu"
          >
            <Menu size={20} className="text-brand-indigo" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-indigo block">
              Dashboard Navigation
            </span>
            <h2 className="text-sm font-extrabold font-heading text-[#1A1A18] dark:text-[#F0F0F0] leading-tight">
              {activeItem?.label || "My Dashboard"}
            </h2>
          </div>
        </div>

        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-indigo text-white text-xs font-semibold shadow-sm hover:bg-brand-indigo/90 transition-colors"
        >
          <PlusCircle size={14} />
          <span>New Listing</span>
        </Link>
      </div>

      {/* ── MOBILE SLIDE-OVER DRAWER SIDEBAR (< lg screens) ───────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-[285px] max-w-[85vw] bg-[#12141C] text-white h-full flex flex-col shadow-2xl z-50 animate-slide-right">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-brand-indigo shadow-md"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-heading truncate text-white leading-tight">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Dashboard Section */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-3 block mb-2">
                  My Marketplace
                </span>
                <div className="space-y-1">
                  {navItems
                    .filter((item) => item.section === "dashboard")
                    .map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href ||
                        (item.href === "/dashboard/listings" && pathname.startsWith("/dashboard/listings"));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            active
                              ? "bg-brand-indigo text-white font-semibold shadow-md shadow-brand-indigo/30"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={14} className={active ? "text-white/80" : "text-slate-600"} />
                        </Link>
                      );
                    })}
                </div>
              </div>

              {/* Account Settings Section */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-3 block mb-2">
                  Account Settings
                </span>
                <div className="space-y-1">
                  {navItems
                    .filter((item) => item.section === "account")
                    .map((item) => {
                      const Icon = item.icon;
                      const active = item.tab
                        ? pathname === "/dashboard/profile" && currentTab === item.tab
                        : pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            active
                              ? "bg-brand-indigo text-white font-semibold shadow-md shadow-brand-indigo/30"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={14} className={active ? "text-white/80" : "text-slate-600"} />
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Bottom Log out Action */}
            <div className="p-4 border-t border-white/10 bg-slate-950/40">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-xl transition-all"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP MAIN WRAPPER ─────────────────────────────────────── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* ── DESKTOP SIDEBAR (≥ lg screens) ───────────────────────────── */}
        <aside className="hidden lg:flex w-[260px] bg-[#F0F0EC] dark:bg-[#101216] flex-col flex-shrink-0 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto z-30 border-r border-[#E5E5E0] dark:border-[#26282E]">
          
          {/* User info block */}
          <div className="p-6 border-b border-[#E5E5E0] dark:border-[#26282E]">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#26282E] shadow-sm"
              />
              <div className="min-w-0">
                <h2 className="text-base font-bold font-heading truncate leading-tight text-[#1A1A18] dark:text-[#F0F0F0]">
                  {user.name}
                </h2>
                <p className="text-sm text-[#6B6B66] truncate">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex-1 py-3 flex flex-col gap-0.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.tab
                ? pathname === "/dashboard/profile" && currentTab === item.tab
                : pathname === item.href ||
                  (item.href === "/dashboard/listings" && pathname.startsWith("/dashboard/listings"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 h-11 text-sm transition-all duration-150 rounded-lg font-medium select-none relative",
                    active
                      ? "bg-brand-indigo/10 text-brand-indigo font-semibold"
                      : "text-[#6B6B66] hover:bg-[#E5E5E0] dark:hover:bg-[#1e2028] hover:text-[#1A1A18] dark:hover:text-[#F0F0F0]"
                  )}
                >
                  {/* Active left accent bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-indigo rounded-r-full" />
                  )}
                  <Icon size={20} className={active ? "text-brand-indigo" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Logout pinned to bottom */}
          <div className="p-3 border-t border-[#E5E5E0] dark:border-[#26282E] mt-auto">
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="w-full flex items-center gap-3 px-3 h-11 text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-600 transition-all rounded-lg font-semibold cursor-pointer select-none"
              title="Log out"
            >
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ── Main content area ───────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 bg-[#FAFAF8] dark:bg-[#16181D] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark">
          <Spinner size="lg" className="text-brand-indigo" />
        </div>
      }
    >
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
