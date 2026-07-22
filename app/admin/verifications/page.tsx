"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck, Eye, AlertCircle, X, Search, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
  student_id: string | null;
  student_id_card_url: string | null;
  verification_status: string;
  verification_reason: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
}

export default function AdminVerificationsPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"pending" | "verified" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Revoke / Reject Modal
  const [revokeTarget, setRevokeTarget] = useState<UserProfile | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Lightbox Modal for ID Document preview
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchVerifications = async () => {
    try {
      const res = await fetch("http://localhost:3002/admin/verifications", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch user verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (profile: UserProfile) => {
    setActionLoading(profile.user_id);
    try {
      const res = await fetch(
        `http://localhost:3002/admin/verifications/${profile.user_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ action: "approve" }),
        }
      );
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.user_id === profile.user_id
              ? { ...p, is_verified: true, verification_status: "verified", verification_reason: null }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRevokeModal = (profile: UserProfile) => {
    setRevokeTarget(profile);
    setRevokeReason("");
    setReasonError("");
  };

  const handleRevokeConfirm = async () => {
    if (!revokeReason.trim()) {
      setReasonError("A reason is required to revoke or reject student verification.");
      return;
    }
    if (!revokeTarget) return;

    setActionLoading(revokeTarget.user_id);
    try {
      const res = await fetch(
        `http://localhost:3002/admin/verifications/${revokeTarget.user_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ action: "revoke", reason: revokeReason.trim() }),
        }
      );
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.user_id === revokeTarget.user_id
              ? {
                  ...p,
                  is_verified: false,
                  verification_status: "rejected",
                  verification_reason: revokeReason.trim(),
                }
              : p
          )
        );
        setRevokeTarget(null);
        setRevokeReason("");
      }
    } catch (err) {
      console.error("Revoke failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter profiles based on selected tab and search query
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.student_id && p.student_id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "pending") return p.verification_status === "pending";
    if (filterTab === "verified") return p.is_verified || p.verification_status === "verified";
    return true; // "all"
  });

  const pendingCount = profiles.filter((p) => p.verification_status === "pending").length;
  const verifiedCount = profiles.filter((p) => p.is_verified || p.verification_status === "verified").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar Row */}
      <div className="flex justify-end">

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search user or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-soft dark:border-border-dark pb-2">
        <button
          onClick={() => setFilterTab("pending")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            filterTab === "pending"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <span>Pending Submissions</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilterTab("verified")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            filterTab === "verified"
              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <span>Verified Users</span>
          <span className="px-2 py-0.5 text-xs bg-sky-500 text-white rounded-full font-bold">
            {verifiedCount}
          </span>
        </button>
        <button
          onClick={() => setFilterTab("all")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            filterTab === "all"
              ? "bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/30"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <span>All Accounts ({profiles.length})</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={48} />}
          title={
            filterTab === "pending"
              ? "No pending verification requests"
              : filterTab === "verified"
              ? "No verified users found"
              : "No users found"
          }
          description={
            filterTab === "pending"
              ? "All student ID applications have been reviewed. New requests will appear here."
              : "No matching profiles found."
          }
        />
      ) : (
        <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-border-soft dark:divide-border-dark">
            {filteredProfiles.map((p) => {
              const isVerified = p.is_verified || p.verification_status === "verified";
              const isPending = p.verification_status === "pending";

              return (
                <div
                  key={p.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img
                      src={p.avatar_url || "/default-avatar.svg"}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border-soft dark:border-border-dark flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/seller/${p.user_id}`}
                          target="_blank"
                          className="font-bold text-text-primary dark:text-gray-100 hover:text-brand-indigo transition-colors"
                        >
                          {p.name}
                        </Link>
                        <VerifiedBadge isVerified={isVerified} size="sm" />
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        @{p.username} · {p.user.email}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-body dark:text-gray-300">
                        <span>
                          <strong>ID Number:</strong> {p.student_id || "Not specified"}
                        </span>
                        <span>
                          <strong>Joined:</strong> {formatDate(p.user.created_at)}
                        </span>
                      </div>

                      {p.verification_reason && !isVerified && (
                        <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 inline-block">
                          <strong>Revocation Reason:</strong> {p.verification_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Student ID Card Preview */}
                  <div className="flex-shrink-0 flex items-center gap-4">
                    {p.student_id_card_url ? (
                      <div
                        onClick={() => setLightboxUrl(p.student_id_card_url)}
                        className="relative group cursor-pointer border border-border-soft dark:border-border-dark rounded-xl p-1 bg-gray-50 dark:bg-gray-800 hover:border-brand-indigo transition-colors"
                        title="Click to expand Student ID card"
                      >
                        <img
                          src={p.student_id_card_url}
                          alt="Student ID Document"
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-xl border border-dashed border-border-soft dark:border-border-dark flex items-center justify-center text-text-muted text-[11px] text-center p-1 bg-gray-50 dark:bg-gray-800/40">
                        No ID image
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 min-w-[130px]">
                      {!isVerified ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 flex items-center justify-center gap-1.5"
                          loading={actionLoading === p.user_id}
                          onClick={() => handleApprove(p)}
                        >
                          <CheckCircle2 size={14} />
                          Approve Blue Tick
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-3 py-2 flex items-center justify-center gap-1.5"
                          loading={actionLoading === p.user_id}
                          onClick={() => openRevokeModal(p)}
                        >
                          <ShieldOff size={14} />
                          Revoke Blue Tick
                        </Button>
                      )}

                      {isPending && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs px-3 py-1.5"
                          disabled={actionLoading === p.user_id}
                          onClick={() => openRevokeModal(p)}
                        >
                          <XCircle size={13} />
                          Reject Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revoke / Reject Modal with mandatory reason */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title={revokeTarget?.is_verified ? "Revoke Blue Tick Verification" : "Reject Verification Request"}
        size="md"
      >
        {revokeTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border-soft dark:border-border-dark">
              <img
                src={revokeTarget.avatar_url || "/default-avatar.svg"}
                alt=""
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary dark:text-gray-100">
                  {revokeTarget.name} (@{revokeTarget.username})
                </p>
                <p className="text-xs text-text-muted">{revokeTarget.user.email}</p>
              </div>
            </div>

            <Textarea
              id="revoke-reason"
              label="Revocation / Rejection Reason *"
              placeholder="Explain why this student ID verification is being revoked or rejected. The user will see this message."
              value={revokeReason}
              onChange={(e) => {
                setRevokeReason(e.target.value);
                if (e.target.value.trim()) setReasonError("");
              }}
              error={reasonError}
              rows={4}
            />

            <p className="text-xs text-text-muted">
              A reason is <strong>required</strong>. The user will receive this explanation on their profile settings page.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setRevokeTarget(null)}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                fullWidth
                loading={!!actionLoading}
                onClick={handleRevokeConfirm}
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Lightbox for Student ID Image */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-2xl w-full flex items-center justify-center">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 bg-white/10 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxUrl}
              alt="Student ID Document Large"
              className="max-h-[85vh] max-w-full rounded-xl border border-white/10 shadow-2xl object-contain animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
