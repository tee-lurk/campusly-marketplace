"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  darkMode: boolean;
  toggleDark: () => void;
}

export function Navbar({ onSearch, searchValue = "", darkMode, toggleDark }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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
          const res = await fetch("http://localhost:3002/users/me/notifications", {
            headers: { Authorization: `Bearer ${localStorage.getItem("campusly_access_token")}` },
          });
          if (res.ok) {
            const data = await res.json();
            
            // Only show today's messages (last 24 hours) in the navbar
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
    <header className="sticky top-0 z-40 bg-card/95 dark:bg-card-dark/95 backdrop-blur-sm border-b border-border-soft dark:border-border-dark">
      <div className={isDashboard ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-indigo flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-heading font-bold text-brand-indigo text-lg tracking-tight hidden sm:block">
              Campusly
            </span>
          </Link>

          {/* Search bar */}
          {!isDashboard ? (
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="search"
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (isSearchPage) onSearch?.(e.target.value);
                  }}
                  placeholder="Search modules, notes, past exams, video lectures…"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-pill border border-border-soft dark:border-border-dark bg-canvas dark:bg-canvas-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo transition-all"
                />
              </div>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative" ref={notifRef}>
                    <button
                      onClick={handleOpenNotifs}
                      className="p-2 rounded-md text-text-muted hover:text-text-body hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                      aria-label="Notifications"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-card dark:border-card-dark" />
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-card dark:bg-card-dark rounded-xl border border-border-soft dark:border-border-dark shadow-xl py-2 animate-slide-up z-50">
                        <div className="px-4 py-2 border-b border-border-soft dark:border-border-dark flex justify-between items-center mb-1">
                          <h3 className="text-sm font-semibold text-text-primary dark:text-gray-100">Messages</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-text-muted">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">No messages</p>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {notifications.map((n) => (
                                <Link
                                  key={n.id}
                                  href="/dashboard/messages"
                                  onClick={() => setNotifOpen(false)}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-border-soft dark:border-border-dark last:border-0 flex gap-3"
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    n.type === 'rejection' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                                    n.type === 'approval' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
                                    'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                  }`}>
                                    {n.type === 'rejection' && <AlertCircle size={16} />}
                                    {n.type === 'approval' && <CheckCircle size={16} />}
                                    {n.type === 'sale' && <ShoppingBag size={16} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary dark:text-gray-100 line-clamp-1">
                                      {n.type === 'rejection' && 'Listing Rejected'}
                                      {n.type === 'approval' && 'Listing Approved'}
                                      {n.type === 'sale' && 'New Sale!'}
                                    </p>
                                    <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
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
                        
                        <div className="px-4 py-2 border-t border-border-soft dark:border-border-dark mt-1">
                          <Link
                            href="/dashboard/messages"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs font-semibold text-brand-indigo hover:text-brand-indigo-dark block text-center"
                          >
                            View all messages
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {!pathname.startsWith("/dashboard") && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        id="user-menu-button"
                        onClick={() => {
                        setNotifOpen(false);
                        setDropdownOpen((v) => !v);
                      }}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-btn hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-border-soft"
                      />
                      <span className="text-sm font-medium text-text-primary dark:text-gray-100 hidden md:block max-w-[120px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-card dark:bg-card-dark rounded-xl border border-border-soft dark:border-border-dark shadow-card-hover py-1 animate-slide-up">
                        <div className="px-3 py-2 border-b border-border-soft dark:border-border-dark mb-1">
                          <p className="text-sm font-semibold text-text-primary dark:text-gray-100 truncate">{user.name}</p>
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                        <DropdownItem href="/dashboard/profile" icon={<User size={15} />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/dashboard/messages" icon={<Bell size={15} />} label="Messages" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/dashboard/listings" icon={<ListOrdered size={15} />} label="My Listings" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/dashboard/purchases" icon={<ShoppingBag size={15} />} label="My Purchases" onClick={() => setDropdownOpen(false)} />
                        {user.role === "admin" && (
                          <DropdownItem href="/admin" icon={<Shield size={15} />} label="Admin Panel" onClick={() => setDropdownOpen(false)} className="text-brand-indigo" />
                        )}
                        <div className="border-t border-border-soft dark:border-border-dark mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          >
                            <LogOut size={15} />
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
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
      className={`flex items-center gap-2.5 px-3 py-2 text-sm text-text-body dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
    >
      {icon}
      {label}
    </Link>
  );
}
