"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle, Search, ArrowRight, MessageSquare, ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("http://localhost:3002/users/me/notifications", {
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
    
    // Also mark as viewed locally when this page is visited
    const now = new Date().toISOString();
    localStorage.setItem("campusly_user_notif_viewed", now);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
            Messages
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Updates and notices regarding your listings.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="No messages"
          description="You don't have any messages or notifications at the moment."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Product Thumbnail */}
              <div className="w-24 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-border-soft dark:border-border-dark hidden md:block">
                {notif.product.images[0] ? (
                  <img
                    src={notif.product.images[0].image_url}
                    alt={notif.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                    No img
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {notif.type === 'rejection' && <AlertCircle size={16} className="text-red-500" />}
                    {notif.type === 'approval' && <CheckCircle size={16} className="text-green-500" />}
                    {notif.type === 'sale' && <ShoppingBag size={16} className="text-blue-500" />}
                    <h3 className="text-base font-bold text-text-primary dark:text-gray-100 font-heading">
                      {notif.type === 'rejection' && 'Listing Requires Revision'}
                      {notif.type === 'approval' && 'Listing Approved!'}
                      {notif.type === 'sale' && 'New Sale!'}
                    </h3>
                  </div>
                  <p className="text-sm text-text-body dark:text-gray-300">
                    {notif.type === 'rejection' && <>Your listing <span className="font-semibold text-text-primary dark:text-gray-100">"{notif.product.title}"</span> was reviewed and needs some changes before it can be published.</>}
                    {notif.type === 'approval' && <>Your listing <span className="font-semibold text-text-primary dark:text-gray-100">"{notif.product.title}"</span> has been approved and is now live on the marketplace.</>}
                    {notif.type === 'sale' && <>User <span className="font-semibold text-text-primary dark:text-gray-100">@{notif.buyer.profile.username}</span> just purchased your listing <span className="font-semibold text-text-primary dark:text-gray-100">"{notif.product.title}"</span>.</>}
                  </p>
                </div>

                {notif.type === 'rejection' && (
                  <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-2">
                      Reviewer's Note
                    </h4>
                    <p className="text-sm text-red-900/80 dark:text-red-300/80 italic">
                      "{notif.reason}"
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock size={14} />
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </div>

                  {notif.type === 'rejection' && (
                    <Link href={`/dashboard/listings/${notif.product.id}/edit`}>
                      <Button size="sm" className="gap-2 bg-brand-indigo hover:bg-brand-indigo-dark text-white shadow-sm">
                        Edit & Resubmit
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  )}
                  {notif.type === 'approval' && (
                    <Link href={`/product/${notif.product.id}`}>
                      <Button size="sm" variant="secondary" className="gap-2 shadow-sm">
                        View Live
                        <ExternalLink size={16} />
                      </Button>
                    </Link>
                  )}
                  {notif.type === 'sale' && (
                    <Link href="/dashboard/earnings">
                      <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                        View Earnings
                        <ArrowRight size={16} />
                      </Button>
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
