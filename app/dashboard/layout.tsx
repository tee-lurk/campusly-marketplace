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
  PlusCircle,
  ChevronsLeft,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  tab?: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "My Marketplace",
    items: [
      { href: "/dashboard/listings", label: "My Listings", icon: ListChecks },
      { href: "/dashboard/purchases", label: "My Purchases", icon: ShoppingBag },
      { href: "/dashboard/earnings", label: "My Earnings", icon: Wallet },
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Account Settings",
    items: [
      { href: "/dashboard/profile", label: "Profile Settings", icon: User, tab: "profile" },
      { href: "/dashboard/profile?tab=password", label: "Password", icon: Lock, tab: "password" },
      { href: "/dashboard/profile?tab=notifications", label: "Notifications", icon: Bell, tab: "notifications" },
      { href: "/dashboard/profile?tab=verification", label: "Verification", icon: ShieldCheck, tab: "verification" },
    ],
  },
];

// Flat list for easy matching
const allNavItems = sidebarGroups.flatMap((g) => g.items);

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sidebar preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user_sidebar_open");
    if (saved !== null) {
      setSidebarOpen(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("user_sidebar_open", String(next));
      return next;
    });
  };

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
  const activeItem = allNavItems.find((item) =>
    item.tab
      ? pathname === "/dashboard/profile" && currentTab === item.tab
      : pathname === item.href ||
        (item.href === "/dashboard/listings" && pathname.startsWith("/dashboard/listings"))
  );

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col font-sans text-gray-800 dark:text-gray-200">
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
          <div className="relative w-[285px] max-w-[85vw] bg-[#fdfdfd] dark:bg-[#101216] text-gray-900 dark:text-white h-full flex flex-col shadow-2xl z-50 border-r border-gray-100 dark:border-[#26282E]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-brand-indigo shadow-md"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-heading truncate leading-tight text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {sidebarGroups.map((group, idx) => (
                <div key={idx}>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-indigo-400 px-2 block mb-2">
                    {group.label}
                  </span>
                  <div className="space-y-1">
                    {group.items.map((item) => {
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
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                            active
                              ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                              : "text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={active ? "text-white" : "text-gray-400 dark:text-slate-400"} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={14} className={active ? "text-white/80" : "text-gray-400 dark:text-slate-600"} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Log out Action */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-950/40">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 rounded-xl transition-all"
              >
                <LogOut size={18} className="text-white" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP MAIN WRAPPER ─────────────────────────────────────── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* ── DESKTOP SIDEBAR (≥ lg screens) ───────────────────────────── */}
        <aside
          className={cn(
            "hidden lg:flex flex-col bg-[#fdfdfd] dark:bg-[#101216] transition-all duration-300 border-r border-gray-100 dark:border-[#26282E] sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden z-30 flex-shrink-0",
            sidebarOpen ? "w-[260px]" : "w-[80px]"
          )}
        >
          {/* User info & Collapse toggle header */}
          <div className="h-[72px] flex items-center justify-between px-4 border-b border-gray-100 dark:border-[#26282E] flex-shrink-0">
            <div className={cn("flex items-center gap-3 min-w-0 flex-1", !sidebarOpen && "hidden")}>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/20 shadow-sm flex-shrink-0 bg-gray-200"
              />
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate leading-tight text-gray-900 dark:text-gray-100">
                  {user.name}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  @{user.username}
                </p>
              </div>
            </div>

            {!sidebarOpen && (
              <div className="w-full flex items-center justify-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/20 shadow-sm bg-gray-200"
                  title={user.name}
                />
              </div>
            )}

            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2028] transition-colors flex-shrink-0"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronsLeft
                size={20}
                className={cn("transition-transform duration-300", !sidebarOpen && "rotate-180")}
              />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 flex flex-col justify-between">
            <div className="space-y-6">
              {sidebarGroups.map((group, idx) => (
                <div key={idx}>
                  {sidebarOpen && (
                    <div className="px-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      {group.label}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
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
                            "flex items-center px-3 py-2.5 rounded-xl text-[13px] transition-all",
                            active
                              ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#1e2028] dark:hover:text-white",
                            !sidebarOpen && "justify-center px-0"
                          )}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
                            <Icon size={18} className={active ? "text-white" : "text-gray-400 dark:text-gray-400"} />
                            {sidebarOpen && <span>{item.label}</span>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Logout pinned at bottom of navigation scroll */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#26282E] mt-6">
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all",
                  sidebarOpen ? "justify-between" : "justify-center px-0"
                )}
                title={!sidebarOpen ? "Log out" : undefined}
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-white" />
                  {sidebarOpen && <span>Log out</span>}
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content area ───────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 bg-[#FAFAF8] dark:bg-[#16181D] overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Custom Scrollbar Styling matching Admin Panel */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}} />
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
