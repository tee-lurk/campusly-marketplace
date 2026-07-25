"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle, ShoppingBag, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { API_BASE_URL } from "@/lib/api";

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusly_access_token")}`,
          },
        });
        if (res.ok) {
          setNotifications(await res.json());
        } else {
          setError("Failed to fetch messages.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
    const now = new Date().toISOString();
    localStorage.setItem("campusly_user_notif_viewed", now);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "sale":
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-emerald-600" />
          </div>
        );
      case "approval":
        return (
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-brand-indigo" />
          </div>
        );
      case "rejection":
        return (
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={20} className="text-[#6B6B66]" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold font-heading text-[#1A1A18] dark:text-[#F0F0F0] leading-tight">
          Messages
        </h1>
        <p className="text-sm text-[#6B6B66] mt-1.5">
          Updates and notices regarding your listings.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="No messages"
          description="You don't have any messages or notifications at the moment."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl p-6 flex gap-4 items-start"
            >
              {/* Icon */}
              {getIcon(notif.type)}

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A18] dark:text-[#F0F0F0] font-heading mb-1">
                    {notif.type === "rejection" && "Listing Requires Revision"}
                    {notif.type === "approval" && "Listing Approved!"}
                    {notif.type === "sale" && "New Sale!"}
                  </h3>
                  <p className="text-sm text-[#6B6B66] leading-relaxed">
                    {notif.type === "rejection" && <>Your listing <span className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">&ldquo;{notif.product.title}&rdquo;</span> was reviewed and needs some changes before it can be published.</>}
                    {notif.type === "approval" && <>Your listing <span className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">&ldquo;{notif.product.title}&rdquo;</span> has been approved and is now live on the marketplace.</>}
                    {notif.type === "sale" && <>User <span className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">@{notif.buyer.profile.username}</span> just purchased your listing <span className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">&ldquo;{notif.product.title}&rdquo;</span>.</>}
                  </p>
                </div>

                {notif.type === "rejection" && (
                  <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1.5">
                      Reviewer&apos;s Note
                    </h4>
                    <p className="text-sm text-red-900/80 dark:text-red-300/80 italic">
                      &ldquo;{notif.reason}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <Clock size={14} />
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </div>

                  {notif.type === "rejection" && (
                    <Link href={`/dashboard/listings/${notif.product.id}/edit`}>
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-indigo border border-brand-indigo/30 bg-brand-indigo/5 hover:bg-brand-indigo/10 rounded-lg transition-colors">
                        Edit & Resubmit
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  )}
                  {notif.type === "approval" && (
                    <Link href={`/product/${notif.product.id}`}>
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-indigo border border-brand-indigo/30 bg-brand-indigo/5 hover:bg-brand-indigo/10 rounded-lg transition-colors">
                        View Live
                        <ExternalLink size={14} />
                      </button>
                    </Link>
                  )}
                  {notif.type === "sale" && (
                    <Link href="/dashboard/earnings">
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-indigo border border-brand-indigo/30 bg-brand-indigo/5 hover:bg-brand-indigo/10 rounded-lg transition-colors">
                        View Earnings
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
