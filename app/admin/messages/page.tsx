"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, 
  Search, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Clock, 
  User, 
  Filter, 
  Plus, 
  RefreshCw, 
  FileText, 
  Check, 
  ChevronRight,
  ShoppingBag,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface AdminMessageThread {
  id: string;
  type: "verification" | "listing_review" | "report" | "direct_support";
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    role?: string;
    verification_status?: string;
  };
  subject: string;
  snippet: string;
  timestamp: string;
  unread: boolean;
  status: "pending" | "resolved" | "rejected" | "action_required";
  details?: {
    id_card_url?: string;
    product_id?: string;
    product_title?: string;
    reason?: string;
    notes?: string[];
  };
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<AdminMessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "verification" | "listing" | "support">("all");
  
  // Quick action states
  const [replyText, setReplyText] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  // Compose Modal State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchMessagesData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [verifRes, prodRes, activityRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/verifications`, {
          headers: { Authorization: `Bearer ${token()}` }
        }),
        fetch(`${API_BASE_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token()}` }
        }),
        fetch(`${API_BASE_URL}/admin/activity/recent?filter=all&limit=30`, {
          headers: { Authorization: `Bearer ${token()}` }
        }),
        fetch(`${API_BASE_URL}/admin/users?limit=50`, {
          headers: { Authorization: `Bearer ${token()}` }
        })
      ]);

      let formattedThreads: AdminMessageThread[] = [];

      // 1. Process Verification Requests as Threads
      if (verifRes.ok) {
        const verifications = await verifRes.json();
        verifications.forEach((item: any) => {
          formattedThreads.push({
            id: `verif-${item.user_id}`,
            type: "verification",
            user: {
              id: item.user_id,
              name: item.name || item.user?.profile?.name || "Student User",
              username: item.username || item.user?.profile?.username || "student",
              avatar: item.user?.profile?.avatar,
              role: item.user?.role || "user",
              verification_status: item.verification_status
            },
            subject: "Student Identity Verification Request",
            snippet: `${item.name} submitted Student ID verification document for account verification badge.`,
            timestamp: item.user?.created_at || new Date().toISOString(),
            unread: item.verification_status === "pending",
            status: item.verification_status === "pending" ? "pending" : item.verification_status === "verified" ? "resolved" : "rejected",
            details: {
              id_card_url: item.id_card_url,
              notes: item.verification_status === "pending" 
                ? ["Submitted verification documents.", "Awaiting admin review."]
                : [`Verification status updated to: ${item.verification_status}`]
            }
          });
        });
      }

      // 2. Process Pending Product Reviews
      if (prodRes.ok) {
        const pendingProducts = await prodRes.json();
        pendingProducts.forEach((prod: any) => {
          const sellerName = prod.seller?.profile?.name || prod.seller?.email || "Seller";
          const sellerUsername = prod.seller?.profile?.username || "seller";
          formattedThreads.push({
            id: `prod-${prod.id}`,
            type: "listing_review",
            user: {
              id: prod.seller_id || prod.seller?.id,
              name: sellerName,
              username: sellerUsername,
              avatar: prod.seller?.profile?.avatar,
              role: prod.seller?.role || "user"
            },
            subject: `Listing Approval Required: "${prod.title}"`,
            snippet: `Seller listed a new item "${prod.title}" priced at ETB ${prod.price}. Review item details before publishing to marketplace.`,
            timestamp: prod.created_at || new Date().toISOString(),
            unread: true,
            status: "pending",
            details: {
              product_id: prod.id,
              product_title: prod.title,
              notes: [`Listing submitted for review. Price: ETB ${prod.price}.`]
            }
          });
        });
      }

      // 3. Process Activity Feed Items / Reports
      if (activityRes.ok) {
        const activities = await activityRes.json();
        activities.forEach((act: any) => {
          if (act.type === "report") {
            formattedThreads.push({
              id: `act-${act.id}`,
              type: "report",
              user: {
                id: act.user_id || "system",
                name: act.user_name || "Platform Reporter",
                username: act.user_username || "anonymous",
                role: "user"
              },
              subject: `Content Report: ${act.title || "Policy Violation Inquiry"}`,
              snippet: act.description || "A user reported a listing or account violating marketplace guidelines.",
              timestamp: act.timestamp || new Date().toISOString(),
              unread: true,
              status: "action_required",
              details: {
                notes: [act.description || "Report logged in activity system."]
              }
            });
          }
        });
      }

      // 4. Save fetched users for direct messaging
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(Array.isArray(usersData) ? usersData : usersData.items || []);
      }

      // Sort descending by timestamp
      formattedThreads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setThreads(formattedThreads);
      if (formattedThreads.length > 0 && !selectedThreadId) {
        setSelectedThreadId(formattedThreads[0].id);
      }
    } catch (err) {
      console.error("Error fetching admin messages:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessagesData();
    localStorage.setItem("admin_last_viewed_msg_time", Date.now().toString());
  }, []);

  // Filter threads by tab & search query
  const filteredThreads = threads.filter(t => {
    if (activeTab === "verification" && t.type !== "verification") return false;
    if (activeTab === "listing" && t.type !== "listing_review") return false;
    if (activeTab === "support" && (t.type !== "report" && t.type !== "direct_support")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.user.name.toLowerCase().includes(q);
      const matchUsername = t.user.username.toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchSnippet = t.snippet.toLowerCase().includes(q);
      return matchName || matchUsername || matchSubject || matchSnippet;
    }
    return true;
  });

  const selectedThread = threads.find(t => t.id === selectedThreadId) || filteredThreads[0];

  // Actions
  const handleApproveVerification = async (userId: string) => {
    setActionLoading(true);
    setActionSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ verification_status: "verified" })
      });
      if (res.ok) {
        setActionSuccess("Verification approved successfully!");
        fetchMessagesData(true);
      }
    } catch (e) {
      console.error("Failed to approve verification", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVerification = async (userId: string) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    setActionSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ verification_status: "rejected", rejection_reason: rejectionReason })
      });
      if (res.ok) {
        setActionSuccess("Verification rejected with feedback sent to user.");
        setRejectionReason("");
        fetchMessagesData(true);
      }
    } catch (e) {
      console.error("Failed to reject verification", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewListing = async (productId: string, status: "approved" | "rejected") => {
    setActionLoading(true);
    setActionSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ status, rejection_reason: status === "rejected" ? rejectionReason : undefined })
      });
      if (res.ok) {
        setActionSuccess(`Listing ${status} successfully!`);
        setRejectionReason("");
        fetchMessagesData(true);
      }
    } catch (e) {
      console.error("Failed to review listing", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setActionLoading(true);
    setTimeout(() => {
      if (selectedThread) {
        setThreads(prev => prev.map(t => {
          if (t.id === selectedThread.id) {
            return {
              ...t,
              details: {
                ...t.details,
                notes: [...(t.details?.notes || []), `Admin Reply: "${replyText}"`]
              }
            };
          }
          return t;
        }));
      }
      setReplyText("");
      setActionSuccess("Message response sent to user!");
      setActionLoading(false);
    }, 400);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !composeSubject || !composeBody) return;
    setSendingMessage(true);

    const targetUser = usersList.find(u => u.id === targetUserId);
    setTimeout(() => {
      const newThread: AdminMessageThread = {
        id: `direct-${Date.now()}`,
        type: "direct_support",
        user: {
          id: targetUserId,
          name: targetUser?.name || targetUser?.profile?.name || "Marketplace User",
          username: targetUser?.username || targetUser?.profile?.username || "user",
          avatar: targetUser?.profile?.avatar,
          role: targetUser?.role || "user"
        },
        subject: composeSubject,
        snippet: composeBody,
        timestamp: new Date().toISOString(),
        unread: false,
        status: "resolved",
        details: {
          notes: [`Admin Message Sent: "${composeBody}"`]
        }
      };

      setThreads(prev => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);
      setShowComposeModal(false);
      setComposeSubject("");
      setComposeBody("");
      setTargetUserId("");
      setSendingMessage(false);
    }, 400);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "verification":
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ShieldCheck size={11} /> Verification</span>;
      case "listing_review":
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ShoppingBag size={11} /> Listing Review</span>;
      case "report":
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><AlertTriangle size={11} /> Policy Report</span>;
      default:
        return <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Mail size={11} /> Direct Support</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-2">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail size={20} />
            </div>
            Support & Message Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage user inquiries, student ID verifications, seller review requests, and official notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMessagesData(true)}
            disabled={refreshing}
            className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            title="Refresh messages"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin text-indigo-600")} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 rounded-xl transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            <span>New Support Notice</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          
          {/* LEFT COLUMN: Message List & Filters (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl flex flex-col shadow-xs overflow-hidden">
            
            {/* Search and Tab Filters Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/40 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user, handle, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                {[
                  { id: "all", label: "All" },
                  { id: "verification", label: "Verifications" },
                  { id: "listing", label: "Listings" },
                  { id: "support", label: "Support" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50 max-h-[560px]">
              {filteredThreads.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<MessageSquare size={36} />}
                    title="No messages found"
                    description="No threads match your current filter or search criteria."
                  />
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = selectedThreadId === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all flex items-start gap-3.5 hover:bg-gray-50/80 relative",
                        isSelected && "bg-indigo-50/40 border-l-4 border-indigo-600"
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {thread.user.avatar ? (
                          <img
                            src={thread.user.avatar}
                            alt={thread.user.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                            {thread.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {thread.unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {thread.user.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {new Date(thread.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-gray-800 truncate mb-1">
                          {thread.subject}
                        </p>

                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">
                          {thread.snippet}
                        </p>

                        <div className="flex items-center justify-between">
                          {getTypeBadge(thread.type)}
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize",
                            thread.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                            thread.status === "resolved" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                            "bg-red-50 text-red-600 border border-red-200"
                          )}>
                            {thread.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Thread Details & Action Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl flex flex-col shadow-xs overflow-hidden">
            {selectedThread ? (
              <div className="flex flex-col h-full">
                
                {/* Thread Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedThread.user.avatar ? (
                      <img
                        src={selectedThread.user.avatar}
                        alt={selectedThread.user.name}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200">
                        {selectedThread.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{selectedThread.user.name}</h3>
                        <span className="text-xs text-gray-400">@{selectedThread.user.username}</span>
                        {selectedThread.user.verification_status === "verified" && (
                          <span title="Verified User">
                            <ShieldCheck size={16} className="text-blue-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>Role: <strong className="capitalize text-gray-700">{selectedThread.user.role}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          {new Date(selectedThread.timestamp).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {getTypeBadge(selectedThread.type)}
                  </div>
                </div>

                {/* Feedback / Notification Banner */}
                {actionSuccess && (
                  <div className="m-4 mb-0 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {/* Main Thread Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                  
                  {/* Subject Box */}
                  <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-1">
                      {selectedThread.subject}
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {selectedThread.snippet}
                    </p>
                  </div>

                  {/* Verification Attachment Card if Verification type */}
                  {selectedThread.type === "verification" && selectedThread.details?.id_card_url && (
                    <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                          <FileText size={16} className="text-blue-600" />
                          <span>Submitted Student ID Document</span>
                        </div>
                        <a
                          href={selectedThread.details.id_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Full Image <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="rounded-lg overflow-hidden border border-blue-200/60 max-h-48 bg-white flex items-center justify-center p-2">
                        <img
                          src={selectedThread.details.id_card_url}
                          alt="Student ID Document"
                          className="max-h-44 object-contain rounded"
                        />
                      </div>

                      {/* Action Buttons for Verification */}
                      {selectedThread.user.verification_status === "pending" && (
                        <div className="pt-2 border-t border-blue-100 space-y-3">
                          <p className="text-xs font-semibold text-blue-900">Review Action:</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleApproveVerification(selectedThread.user.id)}
                              disabled={actionLoading}
                              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 size={15} />
                              <span>Approve & Grant Blue Tick</span>
                            </button>
                          </div>

                          <div className="space-y-2 pt-1">
                            <input
                              type="text"
                              placeholder="Reason if rejecting verification..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleRejectVerification(selectedThread.user.id)}
                              disabled={actionLoading || !rejectionReason.trim()}
                              className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle size={15} />
                              <span>Reject Verification</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Listing Review Action Card */}
                  {selectedThread.type === "listing_review" && selectedThread.details?.product_id && (
                    <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <ShoppingBag size={16} className="text-emerald-600" />
                          <span>Pending Item: {selectedThread.details.product_title}</span>
                        </div>
                        <Link
                          href={`/product/${selectedThread.details.product_id}`}
                          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          Preview Listing <ExternalLink size={12} />
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-emerald-100">
                        <button
                          onClick={() => handleReviewListing(selectedThread.details!.product_id!, "approved")}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={15} />
                          <span>Approve & Publish Listing</span>
                        </button>
                      </div>

                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          placeholder="Rejection reason / revision instructions..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleReviewListing(selectedThread.details!.product_id!, "rejected")}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          <span>Request Revision / Reject</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Activity History / Notes */}
                  {selectedThread.details?.notes && selectedThread.details.notes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Communication History
                      </h4>
                      <div className="space-y-2">
                        {selectedThread.details.notes.map((note, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3.5 rounded-xl text-xs leading-relaxed border",
                              note.startsWith("Admin Reply:") || note.startsWith("Admin Message")
                                ? "bg-indigo-600 text-white border-indigo-600 ml-6"
                                : "bg-gray-50 text-gray-700 border-gray-200/80 mr-6"
                            )}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Reply Input */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Send official reply to ${selectedThread.user.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                      className="flex-1 px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={actionLoading || !replyText.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Send size={14} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                  icon={<Mail size={44} />}
                  title="No message selected"
                  description="Select a support thread or verification message from the left menu to view details."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPOSE MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Mail size={18} className="text-indigo-600" />
                Send Support Notice / Direct Message
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Platform User
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Select a User --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.profile?.name || u.email} (@{u.username || u.profile?.username || "user"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Subject / Notice Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Account Security Update / Marketplace Policy Notice"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write message details for the user..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  {sendingMessage ? <Spinner size="sm" className="text-white" /> : <Send size={14} />}
                  <span>Send Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
