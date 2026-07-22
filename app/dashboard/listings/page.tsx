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

type BackendListingStatus = "pending" | "approved" | "rejected" | "sold";

interface BackendListing {
  id: string;
  title: string;
  price: number;
  status: BackendListingStatus;
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
        const res = await fetch("http://localhost:3002/products/mine", {
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem("campusly_access_token");
    try {
      await fetch(`http://localhost:3002/products/${deleteTarget}`, {
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
            My Listings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus size={16} />
            Add New Listing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-4 h-20 animate-pulse" />
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
        <div className="flex flex-col gap-3">
          {listings.map((product) => (
            <div
              key={product.id}
              className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-4 flex gap-4 items-start transition-all hover:shadow-card"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-border-soft dark:border-border-dark">
                {product.images[0] ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <ListOrdered size={20} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-1 font-heading">
                    {product.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {statusBadge[product.status]}
                  <span className="text-xs text-text-muted">
                    {product.category.name} · Listed {formatDate(product.created_at)}
                  </span>
                </div>
                <span className="text-sm font-bold text-brand-indigo font-heading">
                  {formatPrice(product.price)}
                </span>

                {/* Rejection reason */}
                {product.status === "rejected" && product.rejection_reason && (
                  <div className="mt-2">
                    <button
                      onClick={() =>
                        setExpandedRejection(
                          expandedRejection === product.id ? null : product.id
                        )
                      }
                      className="text-xs text-red-500 flex items-center gap-1 hover:underline"
                    >
                      <Info size={12} />
                      {expandedRejection === product.id
                        ? "Hide reason"
                        : "View rejection reason"}
                    </button>
                    {expandedRejection === product.id && (
                      <div className="mt-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2 leading-relaxed">
                        {product.rejection_reason}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/dashboard/listings/${product.id}/edit`}>
                  <button
                    className="p-2 rounded-md text-text-muted hover:text-brand-indigo hover:bg-brand-indigo/5 transition-colors"
                    aria-label="Edit listing"
                  >
                    <Pencil size={15} />
                  </button>
                </Link>
                <button
                  onClick={() => setDeleteTarget(product.id)}
                  className="p-2 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  aria-label="Delete listing"
                >
                  <Trash2 size={15} />
                </button>
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
