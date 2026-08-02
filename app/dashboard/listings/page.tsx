"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ListOrdered, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

type BackendListingStatus = "pending" | "approved" | "rejected" | "sold";

interface BackendListing {
  id: string;
  title: string;
  price: number;
  status: BackendListingStatus;
  is_hidden?: boolean;
  created_at: string;
  category: { id: string; name: string };
  productType: { id: string; name: string };
  images: { id: string; image_url: string }[];
  rejection_reason?: string | null;
}

const statusBadge: Record<BackendListingStatus, React.ReactNode> = {
  pending: <Badge variant="pending">Pending Review</Badge>,
  approved: <Badge variant="approved">Approved</Badge>,
  rejected: <Badge variant="rejected">Rejected</Badge>,
  sold: <Badge variant="sold">Sold</Badge>,
};

export default function MyListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<BackendListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedRejection, setExpandedRejection] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      const token = localStorage.getItem("campusly_access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/products/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, [user]);

  const handleToggleHide = async (productId: string, currentHidden?: boolean) => {
    const token = localStorage.getItem("campusly_access_token");
    if (!token) return;

    setListings((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, is_hidden: !currentHidden } : item
      )
    );

    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/toggle-hide`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setListings((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, is_hidden: currentHidden } : item
          )
        );
      }
    } catch (err) {
      setListings((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, is_hidden: currentHidden } : item
        )
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem("campusly_access_token");
    try {
      await fetch(`${API_BASE_URL}/products/${deleteTarget}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((l) => l.filter((p) => p.id !== deleteTarget));
    } catch (err) {
      console.error("Failed to delete listing:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold font-heading text-gray-900 dark:text-gray-100 leading-tight">
            My Listings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/listings/new" className="w-full sm:w-auto">
          <Button fullWidth className="sm:w-auto">
            <Plus size={16} />
            <span>Add New Listing</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<ListOrdered size={48} />}
          title="No listings yet"
          description="You haven't listed any materials yet. Add your first listing to start selling to fellow students."
          action={{
            label: "Add your first listing",
            onClick: () => router.push("/dashboard/listings/new"),
          }}
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {listings.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:shadow-2xs"
            >
              {/* Product Info Block */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 flex-shrink-0 border border-[#E5E5E0] dark:border-[#26282E]">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ListOrdered size={20} />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 font-heading">
                    {product.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge[product.status]}
                    <span className="text-[11px] text-gray-400 truncate">
                      {product.category.name} • Listed {formatDate(product.created_at)}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-extrabold text-[#2E3192] dark:text-indigo-400 font-heading">
                    {formatPrice(product.price)}
                  </div>

                  {/* Rejection reason if applicable */}
                  {product.status === "rejected" && product.rejection_reason && (
                    <div className="mt-1.5 pt-1">
                      <button
                        onClick={() =>
                          setExpandedRejection(
                            expandedRejection === product.id ? null : product.id
                          )
                        }
                        className="text-xs font-semibold text-red-600 flex items-center gap-1 hover:underline"
                      >
                        <Info size={13} />
                        {expandedRejection === product.id
                          ? "Hide rejection reason"
                          : "View rejection reason"}
                      </button>
                      {expandedRejection === product.id && (
                        <div className="mt-1.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl p-3 leading-relaxed">
                          {product.rejection_reason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar (Visiblity Toggle + Edit + Delete) */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-[#26282E] flex-shrink-0">
                
                {/* Visibility Switch */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border border-[#E5E5E0] dark:border-[#26282E]">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                    product.is_hidden ? "text-gray-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      product.is_hidden ? "bg-gray-400" : "bg-emerald-500 animate-pulse"
                    }`} />
                    {product.is_hidden ? "Hidden" : "Visible"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleHide(product.id, product.is_hidden)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full p-0.5 border-2 border-transparent transition-all duration-300 ease-in-out ${
                      product.is_hidden
                        ? "bg-gray-300 dark:bg-gray-700"
                        : "bg-emerald-500 shadow-2xs"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-md transform transition-all duration-300 ease-out ${
                        product.is_hidden ? "translate-x-0" : "translate-x-4"
                      }`}
                    />
                  </button>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/listings/${product.id}/edit`}>
                    <button
                      className="p-2 rounded-xl text-gray-500 hover:text-[#2E3192] hover:bg-[#2E3192]/10 transition-colors"
                      aria-label="Edit listing"
                      title="Edit listing"
                    >
                      <Pencil size={15} />
                    </button>
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(product.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    aria-label="Delete listing"
                    title="Delete listing"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
