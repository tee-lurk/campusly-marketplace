"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
  ShoppingBag,
  LogOut,
  Shield,
  User,
  Bell,
  AlertCircle,
  CheckCircle,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  darkMode: boolean;
  toggleDark: () => void;
  onMobileMenuToggle?: () => void;
}

export function Navbar({ onSearch, searchValue = "", darkMode, toggleDark, onMobileMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchValue);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Track scroll position for sticky background blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/users/me/notifications`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("campusly_access_token")}` },
          });
          if (res.ok) {
            const data = await res.json();
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const todaysNotifs = data.filter((n: any) => new Date(n.timestamp) >= oneDayAgo);

            setNotifications(todaysNotifs);
            const lastViewed = localStorage.getItem("campusly_user_notif_viewed");
            const viewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;
            const unread = todaysNotifs.filter((n: any) => new Date(n.timestamp).getTime() > viewedTime).length;
            setUnreadCount(unread);
          }
        } catch (err) {}
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenNotifs = () => {
    setNotifOpen((v) => {
      if (!v) {
        setDropdownOpen(false);
        if (notifications.length > 0) {
          const newest = Math.max(...notifications.map((n) => new Date(n.timestamp).getTime()));
          localStorage.setItem("campusly_user_notif_viewed", new Date(newest).toISOString());
        }
        setUnreadCount(0);
        return true;
      }
      return false;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchVal);
    setMobileSearchOpen(false);
    if (pathname !== "/") router.push(`/?search=${encodeURIComponent(searchVal)}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  const isSearchPage = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 border-b",
        isScrolled
          ? "bg-[#FDFBF5]/90 dark:bg-[#18181C]/90 backdrop-blur-md border-[#E5E5E0] dark:border-[#26282E] shadow-2xs"
          : "bg-[#FDFBF5] dark:bg-[#18181C] border-transparent"
      )}
    >
      <div className={isDashboard ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className="flex items-center justify-between gap-3 h-16 relative">
          
          {/* Logo & Hamburger side-by-side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onMobileMenuToggle && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu size={22} className="text-[#2E3192]" />
              </motion.button>
            )}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Campusly Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading font-extrabold text-[#2E3192] text-xl tracking-tight">
                Campusly
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          {!isDashboard && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto">
              <motion.div
                animate={{ scale: searchFocused ? 1.01 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "relative w-full rounded-full transition-all duration-200",
                  searchFocused
                    ? "ring-2 ring-[#2E3192]/20 border-[#2E3192] shadow-xs"
                    : "border-[#E5E5E0] dark:border-[#26282E]"
                )}
              >
                <Search
                  size={16}
                  className={cn(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                    searchFocused ? "text-[#2E3192]" : "text-gray-400"
                  )}
                />
                <input
                  type="search"
                  value={searchVal}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (isSearchPage) onSearch?.(e.target.value);
                  }}
                  placeholder="Search modules, notes, past exams, video lectures…"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 dark:border-[#26282E] bg-gray-50/70 dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#18181C] transition-all"
                />
              </motion.div>
            </form>
          )}

          {/* Mobile Search Overlay Window */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-x-0 top-0 h-16 bg-[#FDFBF5] dark:bg-[#18181C] px-3 flex items-center gap-2 z-50 border-b border-[#E5E5E0] dark:border-[#26282E] shadow-md md:hidden"
              >
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2E3192]" />
                    <input
                      autoFocus
                      type="search"
                      value={searchVal}
                      onChange={(e) => {
                        setSearchVal(e.target.value);
                        if (isSearchPage) onSearch?.(e.target.value);
                      }}
                      placeholder="Search modules, notes, past exams..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#2E3192] bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100 focus:outline-none ring-2 ring-[#2E3192]/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSearchOpen(false)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Mobile Search Icon Button */}
            {!isDashboard && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Open search"
              >
                <Search size={19} className="text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}

            {!user ? (
              <>
                <Link href="/login">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2.5 sm:px-3">Log in</Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="bg-[#2E3192] hover:bg-[#2E3192]/90 font-semibold shadow-xs text-xs sm:text-sm px-3">Sign up</Button>
                  </motion.div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Plus button for New Listing on dashboard */}
                {isDashboard && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard/listings/new"
                      className="w-9 h-9 rounded-xl bg-[#2E3192] text-white flex items-center justify-center shadow-xs hover:bg-[#2E3192]/90 transition-all flex-shrink-0"
                      title="Create New Listing"
                      aria-label="New Listing"
                    >
                      <Plus size={18} />
                    </Link>
                  </motion.div>
                )}

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleOpenNotifs}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-[#18181C]" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-[#26282E] shadow-xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-[#26282E] flex justify-between items-center mb-1">
                          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No recent notifications</p>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {notifications.map((n) => (
                                <Link
                                  key={n.id}
                                  href="/dashboard/messages"
                                  onClick={() => setNotifOpen(false)}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-[#26282E] last:border-0 flex gap-3"
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    n.type === 'rejection' ? 'bg-red-100 text-red-600' :
                                    n.type === 'approval' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-indigo-100 text-indigo-600'
                                  }`}>
                                    {n.type === 'rejection' && <AlertCircle size={15} />}
                                    {n.type === 'approval' && <CheckCircle size={15} />}
                                    {n.type === 'sale' && <ShoppingBag size={15} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                      {n.type === 'rejection' && 'Listing Rejected'}
                                      {n.type === 'approval' && 'Listing Approved'}
                                      {n.type === 'sale' && 'New Sale!'}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                      {n.type === 'rejection' && `"${n.product.title}" needs revision.`}
                                      {n.type === 'approval' && `"${n.product.title}" is now live.`}
                                      {n.type === 'sale' && `@${n.buyer.profile.username} bought "${n.product.title}".`}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#26282E] mt-1">
                          <Link
                            href="/dashboard/messages"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs font-bold text-[#2E3192] hover:underline block text-center"
                          >
                            View message center
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Avatar & Dropdown */}
                {!pathname.startsWith("/dashboard") && (
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      id="user-menu-button"
                      onClick={() => {
                        setNotifOpen(false);
                        setDropdownOpen((v) => !v);
                      }}
                      className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 hidden md:block max-w-[120px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#2E3192]" : ""}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-[#26282E] shadow-xl py-1 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-[#26282E] mb-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">@{user.username}</p>
                          </div>
                          
                          {user.role === "admin" ? (
                            <DropdownItem href="/admin/overview" icon={<Shield size={15} />} label="Admin Dashboard" onClick={() => setDropdownOpen(false)} className="text-[#2E3192] font-semibold" />
                          ) : (
                            <DropdownItem href="/dashboard/listings" icon={<LayoutDashboard size={15} />} label="Seller Dashboard" onClick={() => setDropdownOpen(false)} />
                          )}
                          
                          <div className="border-t border-gray-100 dark:border-[#26282E] mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                            >
                              <LogOut size={15} />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${className}`}
    >
      {icon}
      {label}
    </Link>
  );
}
