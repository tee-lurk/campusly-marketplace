"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Trash2, Users, ListOrdered, Clock, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface SellerProfile {
  username: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

interface MonitorProduct {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  category: { id: string; name: string };
  productType: { id: string; name: string };
  images: { id: string; image_url: string }[];
  seller: { id: string; profile: SellerProfile | null };
}

interface AdminStats {
  totalListings: number;
  totalUsers: number;
  pendingCount: number;
  completedTransactions: number;
  totalRevenue: number;
}

interface PaginatedResponse {
  data: MonitorProduct[];
  total: number;
  page: number;
  pageSize: number;
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  module: "Module",
  notes: "Lecture Notes",
  "past-exam": "Past Exam",
  "video-lecture": "Video Lecture",
};

export default function AdminActivityPage() {
  const [listings, setListings] = useState<MonitorProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [removeTarget, setRemoveTarget] = useState<MonitorProduct | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [removeReasonError, setRemoveReasonError] = useState("");
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch paginated listings
      const params = new URLSearchParams({ page: String(page) });
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);

      const listingsRes = await fetch(
        `${API_BASE_URL}/admin/products/all?${params.toString()}`,
        { headers }
      );
      if (listingsRes.ok) {
        const result: PaginatedResponse = await listingsRes.json();
        setListings(result.data);
        setTotal(result.total);

        // Extract unique categories from first page for the filter dropdown
        if (categories.length === 0 && result.data.length > 0) {
          const cats = await fetch(`${API_BASE_URL}/categories`);
          if (cats.ok) {
            const catData = await cats.json();
            setCategories(catData.map((c: any) => ({ id: c.id, name: c.name })));
          }
        }
      } else {
        setError("Failed to load listings.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleRemoveConfirm = async () => {
    if (!removeReason.trim()) {
      setRemoveReasonError("A removal reason is required.");
      return;
    }
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${removeTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setListings((prev) => prev.filter((p) => p.id !== removeTarget.id));
        setTotal((prev) => prev - 1);
        setRemoveTarget(null);
        setRemoveReason("");
        // Refresh stats
        const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to remove product:", err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">


      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stats row */}
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Listings"
            value={stats.totalListings}
            icon={<ListOrdered size={20} />}
            color="text-brand-indigo"
          />
          <StatCard
            label="Active Users"
            value={stats.totalUsers}
            icon={<Users size={20} />}
            color="text-brand-indigo"
          />
          <StatCard
            label="Pending Review"
            value={stats.pendingCount}
            icon={<Clock size={20} />}
            color="text-amber-600"
          />
          <StatCard
            label="Completed Orders"
            value={stats.completedTransactions}
            icon={<Flag size={20} />}
            color="text-green-500"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
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
            placeholder="Search listings, sellers…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border-soft dark:border-border-dark rounded-btn bg-card dark:bg-card-dark text-text-primary dark:text-gray-100 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo"
          />
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm rounded-btn border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-body dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-text-muted ml-auto">
          {total} result{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[70px_1fr_150px_100px_100px_120px_80px] gap-4 px-5 py-3 border-b border-border-soft dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30">
          {["", "Listing", "Seller", "Category", "Price", "Listed", ""].map((h, i) => (
            <div key={i} className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            No listings match your search.
          </div>
        ) : (
          <div className="divide-y divide-border-soft dark:divide-border-dark">
            {listings.map((product) => {
              const images = product.images.map((img) => img.image_url);
              const sellerProfile = product.seller.profile;
              const sellerAvatar = sellerProfile?.avatar_url ?? "/default-avatar.svg";

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-1 md:grid-cols-[70px_1fr_150px_100px_100px_120px_80px] gap-4 px-5 py-4 items-center hover:bg-gray-50/30 dark:hover:bg-gray-900/20 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border-soft dark:border-border-dark flex-shrink-0">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>

                  {/* Title + type */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-1 font-heading">
                      {product.title}
                    </p>
                    <Badge variant="muted" className="mt-1">
                      {PRODUCT_TYPE_LABELS[product.productType.name] ?? product.productType.name}
                    </Badge>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={sellerAvatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-border-soft"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-text-body dark:text-gray-300 truncate">
                        @{sellerProfile?.username ?? "unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <p className="text-xs text-text-body dark:text-gray-300">
                    {product.category.name}
                  </p>

                  {/* Price */}
                  <p className="text-sm font-bold text-brand-indigo font-heading">
                    {formatPrice(product.price)}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-text-muted">{formatDate(product.created_at)}</p>

                  {/* Remove */}
                  <button
                    onClick={() => {
                      setRemoveTarget(product);
                      setRemoveReason("");
                      setRemoveReasonError("");
                    }}
                    className="p-2 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Remove listing"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Remove Modal */}
      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove listing"
        size="md"
      >
        {removeTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border-soft dark:border-border-dark">
              {removeTarget.images[0] && (
                <img
                  src={removeTarget.images[0].image_url}
                  alt=""
                  className="w-14 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-1">
                  {removeTarget.title}
                </p>
                <p className="text-xs text-text-muted">
                  @{removeTarget.seller.profile?.username ?? "unknown"} ·{" "}
                  {formatPrice(removeTarget.price)}
                </p>
              </div>
            </div>

            <p className="text-sm text-text-muted leading-relaxed">
              This listing will be removed from the public marketplace. The seller will be notified with your stated reason.
            </p>

            <Textarea
              id="remove-reason"
              label="Reason for removal"
              placeholder="Describe the policy violation or issue that requires this listing to be removed…"
              value={removeReason}
              onChange={(e) => {
                setRemoveReason(e.target.value);
                if (e.target.value.trim()) setRemoveReasonError("");
              }}
              error={removeReasonError}
              rows={4}
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setRemoveTarget(null)}
                disabled={removing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                fullWidth
                loading={removing}
                onClick={handleRemoveConfirm}
              >
                Remove Listing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
