"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  ClipboardList,
  Eye,
  X,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface SellerProfile {
  username: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

interface PendingProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  deliverable_file_url: string | null;
  category: { id: string; name: string };
  productType: { id: string; name: string };
  images: { id: string; image_url: string }[];
  seller: { id: string; profile: SellerProfile | null };
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  module: "Module",
  notes: "Lecture Notes",
  "past-exam": "Past Exam",
  "video-lecture": "Video Lecture",
};

export default function AdminQueuePage() {
  const [pending, setPending] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<PendingProduct | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<PendingProduct | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.ok) {
          setPending(await res.json());
        } else {
          setError("Failed to load pending queue.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleApprove = async (product: PendingProduct) => {
    setActionLoading(product.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/products/${product.id}/review`,
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
        setPending((prev) => prev.filter((p) => p.id !== product.id));
        if (detailProduct?.id === product.id) setDetailProduct(null);
      }
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openReject = (product: PendingProduct) => {
    setRejectTarget(product);
    setReason("");
    setReasonError("");
  };

  const handleRejectConfirm = async () => {
    if (!reason.trim()) {
      setReasonError("A rejection reason is required before confirming.");
      return;
    }
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/products/${rejectTarget.id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ action: "reject", reason }),
        }
      );
      if (res.ok) {
        setPending((prev) => prev.filter((p) => p.id !== rejectTarget.id));
        setRejectTarget(null);
        setReason("");
        if (detailProduct?.id === rejectTarget.id) setDetailProduct(null);
      }
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = (product: PendingProduct) => {
    setDetailProduct(product);
    setDetailImageIndex(0);
  };

  return (
    <div className="flex flex-col gap-6">


      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="Queue is clear"
          description="No listings waiting for review — you're all caught up. New submissions will appear here."
        />
      ) : (
        <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[80px_1fr_160px_100px_100px_120px_220px] gap-4 px-5 py-3 border-b border-border-soft dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30">
            {["", "Listing", "Seller", "Category", "Price", "Submitted", "Actions"].map((h) => (
              <div key={h} className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border-soft dark:divide-border-dark">
            {pending.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_160px_100px_100px_120px_220px] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group cursor-pointer"
                onClick={() => openDetail(product)}
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-border-soft dark:border-border-dark">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      No img
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-2 font-heading leading-snug">
                    {product.title}
                  </p>
                  <Badge variant="muted" className="mt-1">
                    {PRODUCT_TYPE_LABELS[product.productType.name] ?? product.productType.name}
                  </Badge>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 min-w-0">
                  {product.seller.profile?.avatar_url ? (
                    <img
                      src={product.seller.profile.avatar_url}
                      alt={product.seller.profile.username}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-border-soft"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-indigo/20 flex items-center justify-center flex-shrink-0 text-brand-indigo text-xs font-bold">
                      {product.seller.profile?.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary dark:text-gray-100 truncate">
                      @{product.seller.profile?.username ?? "unknown"}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="text-xs text-text-body dark:text-gray-300">
                  {product.category.name}
                </div>

                {/* Price */}
                <div className="text-sm font-bold text-brand-indigo font-heading">
                  {formatPrice(product.price)}
                </div>

                {/* Date */}
                <div className="text-xs text-text-muted">
                  {formatDate(product.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openDetail(product)}
                    className="p-1.5 rounded-md text-text-muted hover:text-brand-indigo hover:bg-brand-indigo/5 transition-colors"
                    title="Review listing"
                  >
                    <Eye size={15} />
                  </button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-none text-xs px-2.5 py-1.5"
                    loading={actionLoading === product.id}
                    onClick={() => handleApprove(product)}
                  >
                    <CheckCircle size={13} />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs px-2.5 py-1.5"
                    onClick={() => openReject(product)}
                    disabled={actionLoading === product.id}
                  >
                    <XCircle size={13} />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Full-Page Detail Review UI */}
      {detailProduct && (
        <div className="absolute inset-0 z-50 bg-[#f4f5f7] dark:bg-gray-900 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header Bar */}
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-border-soft dark:border-border-dark px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDetailProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-text-muted hover:text-text-primary"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">Review Submission</h2>
                <p className="text-xs text-text-muted">Submitted by @{detailProduct.seller.profile?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="amber" className="px-3 py-1 text-sm font-semibold animate-pulse">Pending Review</Badge>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
              
              {/* Left Column: Form Details */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 border border-border-soft dark:border-border-dark rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <ClipboardList size={16} />
                    Form Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase">Title</label>
                      <p className="text-lg font-bold text-text-primary dark:text-gray-100 mt-1">{detailProduct.title}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-text-muted uppercase">Category</label>
                        <div className="mt-1">
                          <Badge variant="indigo">{detailProduct.category.name}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted uppercase">Type</label>
                        <div className="mt-1">
                          <Badge variant="muted">{PRODUCT_TYPE_LABELS[detailProduct.productType.name] ?? detailProduct.productType.name}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted uppercase">Price</label>
                        <p className="text-lg font-bold text-brand-indigo mt-1 font-heading">{formatPrice(detailProduct.price)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase">Description</label>
                      <div className="mt-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-border-soft dark:border-border-dark">
                        <p className="text-sm text-text-body dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {detailProduct.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white dark:bg-gray-800 border border-border-soft dark:border-border-dark rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  {detailProduct.seller.profile?.avatar_url ? (
                    <img
                      src={detailProduct.seller.profile.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-border-soft"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-indigo/20 flex items-center justify-center text-brand-indigo font-bold text-lg">
                      {detailProduct.seller.profile?.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-text-primary dark:text-gray-100">
                      {detailProduct.seller.profile?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-text-muted">
                      @{detailProduct.seller.profile?.username ?? "unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Uploads */}
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 border border-border-soft dark:border-border-dark rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Eye size={16} />
                    Uploaded Media
                  </h3>
                  
                  {detailProduct.images.length > 0 ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border-soft dark:border-border-dark bg-black">
                      <img
                        src={detailProduct.images[detailImageIndex]?.image_url}
                        alt={detailProduct.title}
                        className="w-full h-48 md:h-64 object-contain"
                      />
                      {detailProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setDetailImageIndex(
                                (detailImageIndex - 1 + detailProduct.images.length) %
                                  detailProduct.images.length
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDetailImageIndex(
                                (detailImageIndex + 1) % detailProduct.images.length
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full">
                            {detailProduct.images.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setDetailImageIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  i === detailImageIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-text-muted text-sm border border-dashed border-border-soft">
                      No images uploaded
                    </div>
                  )}
                </div>

                {detailProduct.deliverable_file_url && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <FileDown size={18} />
                      Deliverable File
                    </h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-3">
                      This is the file the buyer will receive upon purchase.
                    </p>
                    <a
                      href={detailProduct.deliverable_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      Download & Verify File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-border-soft dark:border-border-dark p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex justify-center z-10">
            <div className="flex gap-4 w-full max-w-md">
              <Button
                variant="destructive"
                className="flex-1 h-12 text-sm shadow-md"
                disabled={actionLoading === detailProduct.id}
                onClick={() => {
                  setDetailProduct(null);
                  openReject(detailProduct);
                }}
              >
                <XCircle size={18} className="mr-2" />
                Reject Listing
              </Button>
              <Button
                className="flex-1 h-12 text-sm bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20"
                loading={actionLoading === detailProduct.id}
                onClick={() => handleApprove(detailProduct)}
              >
                <CheckCircle size={18} className="mr-2" />
                Approve Listing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject listing"
        size="md"
      >
        {rejectTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border-soft dark:border-border-dark">
              {rejectTarget.images[0] && (
                <img
                  src={rejectTarget.images[0].image_url}
                  alt=""
                  className="w-14 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-1">
                  {rejectTarget.title}
                </p>
                <p className="text-xs text-text-muted">
                  @{rejectTarget.seller.profile?.username ?? "unknown"}
                </p>
              </div>
            </div>

            <Textarea
              id="reject-reason"
              label="Rejection reason"
              placeholder="Explain clearly why this listing is being rejected. The seller will see this message."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setReasonError("");
              }}
              error={reasonError}
              rows={4}
            />

            <p className="text-xs text-text-muted">
              A reason is <strong>required</strong>. The seller will receive this explanation so they can resubmit a corrected listing.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setRejectTarget(null)}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                fullWidth
                loading={!!actionLoading}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
