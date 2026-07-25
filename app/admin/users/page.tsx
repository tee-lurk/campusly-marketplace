"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  Ban,
  Unlock,
  Users,
  ShieldCheck,
  ChevronDown,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface UserRow {
  id: string;
  email: string;
  role: string;
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
  profile: {
    username: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
  _count: { products: number };
}

interface UserDetail {
  id: string;
  email: string;
  role: string;
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
  profile: any;
  products: any[];
  transactions: any[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");

  // Ban modal
  const [banTarget, setBanTarget] = useState<UserRow | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banReasonError, setBanReasonError] = useState("");
  const [banning, setBanning] = useState(false);

  // Unban confirm
  const [unbanTarget, setUnbanTarget] = useState<UserRow | null>(null);
  const [unbanning, setUnbanning] = useState(false);

  // Detail modal
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data);
        setTotal(result.total);
      } else {
        setError("Failed to load users.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Close action menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [openMenuId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      setBanReasonError("A ban reason is required.");
      return;
    }
    if (!banTarget) return;
    setBanning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${banTarget.id}/ban`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ reason: banReason.trim() }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banTarget.id
              ? { ...u, is_banned: true, banned_reason: banReason.trim(), banned_at: new Date().toISOString() }
              : u
          )
        );
        setBanTarget(null);
        setBanReason("");
      } else {
        const err = await res.json().catch(() => ({}));
        setBanReasonError(err.message || "Ban failed.");
      }
    } catch {
      setBanReasonError("Network error.");
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setUnbanning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${unbanTarget.id}/unban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === unbanTarget.id
              ? { ...u, is_banned: false, banned_reason: null, banned_at: null }
              : u
          )
        );
        setUnbanTarget(null);
      }
    } catch {
      console.error("Unban failed.");
    } finally {
      setUnbanning(false);
    }
  };

  const openUserDetail = async (userId: string) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setDetailUser(await res.json());
      }
    } catch {
      console.error("Failed to load user detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-6">


      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search by username or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border-soft dark:border-border-dark rounded-btn bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm rounded-btn border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-body dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <span className="text-xs text-text-muted ml-auto">
          {total} user{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[44px_1fr_180px_80px_90px_100px_80px_60px] gap-4 px-5 py-3 border-b border-border-soft dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30">
          {["", "User", "Email", "Role", "Listings", "Joined", "Status", ""].map((h, i) => (
            <div key={i} className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            No users match your search.
          </div>
        ) : (
          <div className="divide-y divide-border-soft dark:divide-border-dark">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 md:grid-cols-[44px_1fr_180px_80px_90px_100px_80px_60px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors cursor-pointer"
                onClick={() => openUserDetail(user.id)}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-border-soft"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-indigo/20 flex items-center justify-center text-brand-indigo text-xs font-bold">
                      {user.profile?.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                {/* Name + username */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-text-primary dark:text-gray-100 truncate">
                      {user.profile?.name ?? "—"}
                    </p>
                    {user.profile?.is_verified && (
                      <VerifiedBadge isVerified showText={false} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">
                    @{user.profile?.username ?? "—"}
                  </p>
                </div>

                {/* Email */}
                <p className="text-xs text-text-body dark:text-gray-300 truncate">
                  {user.email}
                </p>

                {/* Role */}
                <Badge variant={user.role === "admin" ? "indigo" : "muted"}>
                  {user.role}
                </Badge>

                {/* Listing count */}
                <p className="text-sm text-text-body dark:text-gray-300 font-medium">
                  {user._count.products}
                </p>

                {/* Joined */}
                <p className="text-xs text-text-muted">
                  {formatDate(user.created_at)}
                </p>

                {/* Status */}
                {user.is_banned ? (
                  <Badge variant="red">Banned</Badge>
                ) : (
                  <Badge variant="green">Active</Badge>
                )}

                {/* Actions */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === user.id ? null : user.id);
                    }}
                    className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MoreVertical size={15} />
                  </button>

                  {openMenuId === user.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl shadow-lg py-1 animate-slide-up">
                      {user.role !== "admin" && (
                        <>
                          {user.is_banned ? (
                            <button
                              onClick={() => {
                                setUnbanTarget(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                            >
                              <Unlock size={14} />
                              Unban User
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanTarget(user);
                                setBanReason("");
                                setBanReasonError("");
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Ban size={14} />
                              Ban User
                            </button>
                          )}
                        </>
                      )}
                      <Link
                        href={`/seller/${user.id}`}
                        target="_blank"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-body hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Eye size={14} />
                        View Profile
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Ban Modal */}
      <Modal
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        title="Ban User"
        size="md"
      >
        {banTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border-soft dark:border-border-dark">
              {banTarget.profile?.avatar_url ? (
                <img
                  src={banTarget.profile.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-indigo/20 flex items-center justify-center text-brand-indigo font-bold">
                  {banTarget.profile?.name?.charAt(0) ?? "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-text-primary dark:text-gray-100">
                  {banTarget.profile?.name ?? "Unknown"} (@{banTarget.profile?.username ?? "—"})
                </p>
                <p className="text-xs text-text-muted">{banTarget.email}</p>
              </div>
            </div>

            <p className="text-sm text-text-muted leading-relaxed">
              This user will be <strong>immediately locked out</strong> of all authenticated actions. They will see a &quot;Your account has been suspended&quot; message on login.
            </p>

            <Textarea
              id="ban-reason"
              label="Ban reason *"
              placeholder="Explain why this user is being banned…"
              value={banReason}
              onChange={(e) => {
                setBanReason(e.target.value);
                if (e.target.value.trim()) setBanReasonError("");
              }}
              error={banReasonError}
              rows={4}
            />

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setBanTarget(null)} disabled={banning}>
                Cancel
              </Button>
              <Button variant="destructive" fullWidth loading={banning} onClick={handleBan}>
                <Ban size={15} />
                Confirm Ban
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Unban Confirm Modal */}
      <Modal
        isOpen={!!unbanTarget}
        onClose={() => setUnbanTarget(null)}
        title="Unban User"
        size="sm"
      >
        {unbanTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-body dark:text-gray-300">
              Are you sure you want to unban <strong>@{unbanTarget.profile?.username ?? "this user"}</strong>? They will regain full access to the platform immediately.
            </p>
            {unbanTarget.banned_reason && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 text-xs text-red-600 dark:text-red-400">
                <strong>Original ban reason:</strong> {unbanTarget.banned_reason}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setUnbanTarget(null)} disabled={unbanning}>
                Cancel
              </Button>
              <Button fullWidth loading={unbanning} onClick={handleUnban} className="bg-green-600 hover:bg-green-700 text-white">
                <Unlock size={15} />
                Confirm Unban
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!detailUser || detailLoading}
        onClose={() => {
          setDetailUser(null);
          setDetailLoading(false);
        }}
        title={detailUser ? `${detailUser.profile?.name ?? "User"} — Detail` : "Loading…"}
        size="lg"
      >
        {detailLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        )}
        {detailUser && (
          <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
            {/* Profile header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-border-soft dark:border-border-dark">
              {detailUser.profile?.avatar_url ? (
                <img
                  src={detailUser.profile.avatar_url}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-border-soft"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-indigo/20 flex items-center justify-center text-brand-indigo text-xl font-bold">
                  {detailUser.profile?.name?.charAt(0) ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold font-heading text-text-primary dark:text-gray-100">
                    {detailUser.profile?.name ?? "—"}
                  </h3>
                  {detailUser.profile?.is_verified && (
                    <VerifiedBadge isVerified showText={false} size="sm" />
                  )}
                  <Badge variant={detailUser.role === "admin" ? "indigo" : "muted"}>
                    {detailUser.role}
                  </Badge>
                  {detailUser.is_banned && <Badge variant="red">Banned</Badge>}
                </div>
                <p className="text-sm text-text-muted">
                  @{detailUser.profile?.username ?? "—"} · {detailUser.email}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Joined {formatDate(detailUser.created_at)}
                </p>
              </div>
            </div>

            {detailUser.profile?.bio && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary dark:text-gray-100 mb-1">Bio</h4>
                <p className="text-sm text-text-body dark:text-gray-300">{detailUser.profile.bio}</p>
              </div>
            )}

            {detailUser.is_banned && detailUser.banned_reason && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-sm">
                <strong className="text-red-600 dark:text-red-400">Ban reason:</strong>{" "}
                <span className="text-red-600 dark:text-red-400">{detailUser.banned_reason}</span>
                {detailUser.banned_at && (
                  <p className="text-xs text-red-500 mt-1">
                    Banned on {formatDate(detailUser.banned_at)}
                  </p>
                )}
              </div>
            )}

            {/* Their listings */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                Listings ({detailUser.products.length})
              </h4>
              {detailUser.products.length === 0 ? (
                <p className="text-xs text-text-muted">No listings yet.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-border-soft dark:divide-border-dark border border-border-soft dark:border-border-dark rounded-lg">
                  {detailUser.products.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-10 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {p.images?.[0] && (
                          <img src={p.images[0].image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary dark:text-gray-100 truncate">
                          {p.title}
                        </p>
                      </div>
                      <Badge variant={p.status}>{p.status}</Badge>
                      <p className="text-xs font-semibold text-brand-indigo">{formatPrice(p.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Their purchases */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                Purchases ({detailUser.transactions.length})
              </h4>
              {detailUser.transactions.length === 0 ? (
                <p className="text-xs text-text-muted">No purchases yet.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-border-soft dark:divide-border-dark border border-border-soft dark:border-border-dark rounded-lg">
                  {detailUser.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary dark:text-gray-100 truncate">
                          {tx.product?.title ?? "Unknown product"}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          from @{tx.product?.seller?.profile?.username ?? "unknown"}
                        </p>
                      </div>
                      <Badge variant={tx.status === "completed" ? "green" : "amber"}>
                        {tx.status}
                      </Badge>
                      <p className="text-xs font-semibold text-brand-indigo">
                        {formatPrice(tx.product?.price ?? 0)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
