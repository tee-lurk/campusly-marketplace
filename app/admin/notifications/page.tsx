"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { API_BASE_URL } from "@/lib/api";

interface UnifiedNotification {
  id: string;
  type: "verification" | "listing" | "transaction" | "report";
  title: string;
  description: string;
  timestamp: string;
  actionUrl: string;
  actionText: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchUnifiedNotifications = async () => {
    try {
      const [verificationsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/verifications`, {
          headers: { Authorization: `Bearer ${token()}` },
        }),
        fetch(`${API_BASE_URL}/admin/activity/recent?filter=all&limit=50`, {
          headers: { Authorization: `Bearer ${token()}` },
        })
      ]);

      let unified: UnifiedNotification[] = [];

      if (verificationsRes.ok) {
        const data = await verificationsRes.json();
        const pending = data.filter((p: any) => p.verification_status === "pending");
        // Map pending verifications. Give them today's timestamp so they sit at the top.
        pending.forEach((p: any) => {
          unified.push({
            id: `verif-${p.user_id}`,
            type: "verification",
            title: "Verification Request",
            description: `${p.name} (@${p.username}) submitted their student ID for review.`,
            timestamp: new Date().toISOString(), // Force to top
            actionUrl: "/admin/verifications",
            actionText: "Review Request"
          });
        });
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        data.forEach((act: any) => {
          let title = "Platform Activity";
          let actionUrl = "/admin";
          let actionText = "View";

          if (act.type === "listing") {
            title = "New Listing";
            actionUrl = "/admin"; // Or specific product route
          } else if (act.type === "transaction") {
            title = "New Transaction";
            actionUrl = "/admin/transactions";
          } else if (act.type === "report") {
            title = "Product Reported";
            actionUrl = "/admin/activity";
          }

          unified.push({
            id: `act-${act.id}`,
            type: act.type,
            title,
            description: act.description,
            timestamp: act.timestamp,
            actionUrl,
            actionText
          });
        });
      }

      // Sort descending by timestamp
      unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotifications(unified);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnifiedNotifications();
  }, []);

  // Grouping logic
  const grouped: Record<string, UnifiedNotification[]> = {
    "Today": [],
    "Yesterday": [],
    "This Week": [],
    "Older": []
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - (86400000 * 7);

  notifications.forEach(n => {
    const time = new Date(n.timestamp).getTime();
    if (time >= todayStart) {
      grouped["Today"].push(n);
    } else if (time >= yesterdayStart && time < todayStart) {
      grouped["Yesterday"].push(n);
    } else if (time >= weekStart && time < yesterdayStart) {
      grouped["This Week"].push(n);
    } else {
      grouped["Older"].push(n);
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "verification": return <ShieldCheck size={20} className="text-blue-500" />;
      case "listing": return <Tag size={20} className="text-emerald-500" />;
      case "transaction": return <CreditCard size={20} className="text-indigo-500" />;
      case "report": return <AlertTriangle size={20} className="text-red-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case "verification": return "bg-blue-50 border-blue-100";
      case "listing": return "bg-emerald-50 border-emerald-100";
      case "transaction": return "bg-indigo-50 border-indigo-100";
      case "report": return "bg-red-50 border-red-100";
      default: return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
          <Bell size={24} className="text-indigo-600" />
          Notifications
        </h1>
        <p className="text-sm text-gray-500">
          Stay on top of what's happening across your marketplace this week.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title="You're all caught up!"
          description="There are no notifications to display at this time."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={label} className="animate-fade-in">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
                  {label}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((notif) => (
                    <div 
                      key={notif.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                    >
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 ${getBgForType(notif.type)}`}>
                        {getIconForType(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{notif.title}</h3>
                          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {notif.description}
                        </p>
                      </div>

                      <Link 
                        href={notif.actionUrl}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-indigo-600 font-semibold text-xs rounded-xl group-hover:bg-indigo-50 transition-colors"
                      >
                        {notif.actionText}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
