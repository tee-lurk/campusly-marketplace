"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  ShieldAlert,
  Search,
  Bell,
  ChevronDown,
  ChevronsLeft,
  Mail,
  LogOut,
  Hexagon,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const sidebarGroups = [
  {
    label: "General",
    items: [
      { href: "/admin/overview", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin", label: "Products", icon: ClipboardList, exact: true },
      { href: "/admin/users", label: "Customers", icon: Users, exact: false, badge: 4 },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/admin/activity", label: "Content Monitor", icon: Activity, exact: false },
      { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck, exact: false },
    ],
  },
];

const bottomItems = [
  { href: "#", label: "Messages", icon: Mail, badge: 2 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track viewed notifications to clear the badge
  const [lastViewedTime, setLastViewedTime] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("admin_last_viewed_notif_time");
    if (saved) setLastViewedTime(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (showNotifications || pathname === "/admin/notifications") {
      const latest = notifications[0] ? new Date(notifications[0].timestamp).getTime() : 0;
      if (latest > lastViewedTime) {
        setLastViewedTime(latest);
        localStorage.setItem("admin_last_viewed_notif_time", latest.toString());
      }
    }
  }, [showNotifications, pathname, notifications, lastViewedTime]);

  const unreadCount = notifications.filter(n => new Date(n.timestamp).getTime() > lastViewedTime).length;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  // Fetch pending verifications to use as notifications
  useEffect(() => {
    if (user && user.role === "admin") {
      const fetchNotifications = async () => {
        try {
          const [verifRes, prodRes] = await Promise.all([
            fetch("http://localhost:3002/admin/verifications", {
              headers: { Authorization: `Bearer ${localStorage.getItem("campusly_access_token")}` }
            }),
            fetch("http://localhost:3002/admin/products", {
              headers: { Authorization: `Bearer ${localStorage.getItem("campusly_access_token")}` }
            })
          ]);
          
          let merged: any[] = [];
          
          if (verifRes.ok) {
            const data = await verifRes.json();
            const pending = data.filter((p: any) => p.verification_status === "pending").map((p: any) => ({
              id: `verif-${p.user_id}`,
              type: 'verification',
              name: p.name,
              username: p.username,
              timestamp: p.user?.created_at || new Date().toISOString()
            }));
            merged = [...merged, ...pending];
          }
          
          if (prodRes.ok) {
            const data = await prodRes.json();
            const pendingProds = data.map((p: any) => ({
              id: `prod-${p.id}`,
              type: 'product',
              title: p.title,
              sellerName: p.seller?.profile?.username || 'unknown',
              timestamp: p.created_at || new Date().toISOString()
            }));
            merged = [...merged, ...pendingProds];
          }
          
          merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(merged);
        } catch (e) {
          console.error("Failed to fetch notifications", e);
        }
      };
      fetchNotifications();
      
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] dark:bg-gray-900">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f4f5f7] dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 mb-6">
            You don&apos;t have permission to access the admin panel.
          </p>
          <Link href="/" className="text-indigo-600 hover:underline text-sm font-medium">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const getHeaderContent = () => {
    if (pathname === "/admin/users") {
      return { title: "User Management", subtitle: "View, search, and manage all platform users. Ban or unban accounts as needed." };
    }
    if (pathname === "/admin/verifications") {
      return { title: "User Verification Portal", subtitle: "Review uploaded Student IDs, issue blue ticks, or revoke blue ticks with a reason." };
    }
    if (pathname === "/admin/activity") {
      return { title: "Content Monitoring", subtitle: "Monitor active listings and remove content that violates platform policies." };
    }
    if (pathname === "/admin") {
      return { title: "Pending Review Queue", subtitle: "Manage listings awaiting review before they go live." };
    }
    if (pathname === "/admin/overview") {
      return { title: `Hey ${user.name.split(' ')[0]}, Welcome back! 🙌🏻`, subtitle: "Here's what's happening on your platform today." };
    }
    
    let title = "Admin Panel";
    for (const group of sidebarGroups) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          title = item.label;
        }
      }
    }
    
    // Bottom items check
    for (const item of bottomItems) {
      if (pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href))) {
        title = item.label;
      }
    }

    return { title, subtitle: "" };
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[#fdfdfd] flex flex-col transition-all duration-300 border-r border-gray-100",
          sidebarOpen ? "w-[260px]" : "w-[80px]"
        )}
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-transparent">
          <div className={cn("flex items-center gap-2", !sidebarOpen && "hidden")}>
            <div className="w-7 h-7 rounded bg-[#5b52f6] flex items-center justify-center text-white">
              <Hexagon size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-gray-900">Campusly</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <ChevronsLeft size={20} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Navigation Lists */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
            {sidebarGroups.map((group, idx) => (
              <div key={idx} className="mb-6">
                {sidebarOpen && (
                  <div className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {group.label}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all",
                          active
                            ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                          {sidebarOpen && <span>{item.label}</span>}
                        </div>
                        {sidebarOpen && item.badge && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Tools */}
            <div className="mt-8 mb-4">
              {sidebarOpen && (
                <div className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Profit
                </div>
              )}
              <div className="flex flex-col gap-1">
                {bottomItems.map((item) => {
                  const active = item.href !== "#" && pathname.startsWith(item.href);
                  const isNotif = item.label === "Notifications";
                  const badgeValue = isNotif ? (hasUnread ? unreadCount : undefined) : item.badge;
                    
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all",
                        active
                          ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={active ? "text-white" : "text-gray-400"} />
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && badgeValue && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
                          isNotif && hasUnread && !active ? "bg-red-500 text-white shadow-sm shadow-red-500/20" : ""
                        )}>
                          {badgeValue}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="min-h-[80px] py-4 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-40 relative">
          
          {/* Dynamic Header */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {headerContent.title}
            </h1>
            {headerContent.subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{headerContent.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Actions */}
            <div className="flex items-center gap-4">
              
              {/* Notification Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all relative shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                  <Bell size={18} />
                </button>

                {/* Dropdown Card */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                      {hasUnread && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                          No new notifications.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notif: any) => (
                            <Link 
                              key={notif.id}
                              href={notif.type === 'verification' ? "/admin/verifications" : "/admin"}
                              onClick={() => setShowNotifications(false)}
                              className="flex items-start gap-3 p-4 hover:bg-gray-50/80 transition-colors"
                            >
                              {notif.type === 'verification' ? (
                                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex flex-shrink-0 items-center justify-center">
                                  <ShieldCheck size={16} className="text-blue-500" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex flex-shrink-0 items-center justify-center">
                                  <ClipboardList size={16} className="text-emerald-500" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                                  {notif.type === 'verification' ? 'Verification Request' : 'New Listing for Review'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {notif.type === 'verification' 
                                    ? `${notif.name} (@${notif.username}) submitted ID.`
                                    : `@${notif.sellerName} listed: ${notif.title}`}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                                  <span>Review now</span>
                                  <CheckCircle2 size={12} />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-100">
                      <Link 
                        href="/admin/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block px-4 py-3 text-center text-xs font-semibold text-indigo-600 hover:bg-gray-50 transition-colors"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <button className="flex items-center justify-center rounded-full ring-2 ring-white hover:ring-indigo-500/20 transition-all shadow-sm">
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar relative z-0">
          {children}
        </div>
      </main>

      {/* Basic scrollbar styles for this layout */}
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
