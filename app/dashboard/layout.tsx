"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ListOrdered, ShoppingBag, Wallet, LogOut, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/profile", label: "Profile Settings", icon: User },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/listings", label: "My Listings", icon: ListOrdered },
  { href: "/dashboard/purchases", label: "My Purchases", icon: ShoppingBag },
  { href: "/dashboard/earnings", label: "My Earnings", icon: Wallet },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

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

      {/* Stretch layout to edge of screen by removing max-width grids */}
      <div className="flex-1 w-full flex">
        {/* Full-width layout container */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] w-full bg-card dark:bg-card-dark border-none rounded-none shadow-none">
          
          {/* Flush Locked Sidebar (fixed height, locked top, stays static while content scrolls) */}
          <aside className="w-full lg:w-60 bg-gradient-to-b from-brand-indigo to-brand-indigo-dark text-white flex flex-col flex-shrink-0 lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] overflow-y-auto z-30">
            {/* Header: User avatar + name/username */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold font-heading truncate leading-tight text-white">
                    {user.name}
                  </h2>
                  <p className="text-[10px] text-slate-350 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex-1 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href === "/dashboard/listings" &&
                    pathname.startsWith("/dashboard/listings"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 rounded-xl mx-3 font-medium select-none",
                      active
                        ? "bg-white/15 text-white font-bold shadow-sm"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Footer containing ONLY the log out button */}
            <div className="p-4 border-t border-white/10 mt-auto bg-brand-indigo-dark/20">
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all rounded-xl font-semibold cursor-pointer select-none"
                title="Log out"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </aside>

          {/* Main content area (scrolls independently) */}
          <main className="flex-1 p-6 md:p-8 min-w-0 bg-canvas/10 dark:bg-canvas-dark/5 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
