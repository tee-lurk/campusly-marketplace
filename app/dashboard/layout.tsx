"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User, ListChecks, ShoppingBag, Wallet, LogOut, MessageSquare, Lock, Bell, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/listings", label: "My Listings", icon: ListChecks },
  { href: "/dashboard/purchases", label: "My Purchases", icon: ShoppingBag },
  { href: "/dashboard/earnings", label: "My Earnings", icon: Wallet },
  { href: "/dashboard/profile", label: "Profile Settings", icon: User, tab: "profile" },
  { href: "/dashboard/profile?tab=password", label: "Password", icon: Lock, tab: "password" },
  { href: "/dashboard/profile?tab=notifications", label: "Notifications", icon: Bell, tab: "notifications" },
  { href: "/dashboard/profile?tab=verification", label: "Verification", icon: ShieldCheck, tab: "verification" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* ── MOBILE NAVBAR TABS (< lg screens) ───────────────────────── */}
        <div className="lg:hidden w-full bg-[#F0F0EC] dark:bg-[#101216] border-b border-[#E5E5E0] dark:border-[#26282E] sticky top-[64px] z-30 shadow-sm">
          {/* User bar */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#E5E5E0]/60 dark:border-[#26282E]/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-white dark:border-[#26282E] shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-xs font-bold font-heading truncate leading-tight text-[#1A1A18] dark:text-[#F0F0F0]">
                  {user.name}
                </h2>
                <p className="text-[10px] text-[#6B6B66] truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
              title="Log out"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>

          {/* Horizontal Scrollable Tabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
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
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all flex-shrink-0",
                    active
                      ? "bg-brand-indigo text-white font-semibold shadow-sm"
                      : "text-[#6B6B66] dark:text-gray-300 bg-white/60 dark:bg-white/5 hover:bg-[#E5E5E0] dark:hover:bg-[#1e2028]"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

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
