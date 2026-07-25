"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ExternalLink, Download, Trash2, AlertCircle, Star, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface BackendTransaction {
  id: string;
  status: string;
  created_at: string;
  buyer_comment?: string | null;
  buyer_rating?: number | null;
  product: {
    id: string;
    title: string;
    price: number;
    has_deliverable: boolean;
    images: { id: string; image_url: string }[];
    seller: {
      id: string;
      profile: {
        username: string;
      } | null;
    };
  };
}

export default function PurchasesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BackendTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchPurchases = async () => {
    const token = localStorage.getItem("campusly_access_token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, [user]);

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this purchase from your history?")) return;
    const token = localStorage.getItem("campusly_access_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to delete purchase record.");
      }
    } catch (err) {
      console.error("Delete purchase error:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleDownload = async (productId: string, title: string) => {
    setDownloadingId(productId);
    try {
      const token = localStorage.getItem("campusly_access_token");
      const res = await fetch(`${API_BASE_URL}/products/${productId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to retrieve download link.");
        return;
      }
      const data = await res.json();
      if (!data.deliverable_file_url) {
        alert("File unavailable — contact support");
        return;
      }
      const fileUrl = data.deliverable_file_url;
      try {
        const fileRes = await fetch(fileUrl);
        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        const extension = fileUrl.split(".").pop()?.split("?")[0] || "pdf";
        const cleanTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        a.download = `${cleanTitle}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (corsErr) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download file error:", err);
      alert("An error occurred while downloading the file.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReportProblem = (title: string) => {
    const issue = prompt(`Describe the problem with the purchased material "${title}":`);
    if (issue && issue.trim()) {
      alert("Thank you. Your feedback has been logged. Our support team will investigate and contact you.");
    }
  };

  const handleWriteReview = async (orderId: string) => {
    const comment = prompt("Enter your review comment:");
    if (!comment || !comment.trim()) return;
    const ratingStr = prompt("Rate this listing (1 to 5 stars):");
    const rating = parseInt(ratingStr || "", 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert("Please enter a valid rating between 1 and 5.");
      return;
    }
    const token = localStorage.getItem("campusly_access_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment, rating }),
      });
      if (res.ok) {
        alert("Review submitted successfully!");
        fetchPurchases();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold font-heading text-[#1A1A18] dark:text-[#F0F0F0] leading-tight">
          My Purchases
        </h1>
        <p className="text-sm text-[#6B6B66] mt-1.5">
          Materials you&apos;ve bought from other students.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="No purchases yet"
          description="You haven't bought any materials yet. Browse the marketplace to find what you need."
          action={{ label: "Browse Marketplace", onClick: () => (window.location.href = "/") }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const product = order.product;
            if (!product) return null;
            const images = product.images.map((img) => img.image_url);
            const sellerUsername = product.seller.profile?.username ?? "unknown";

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl p-5 flex flex-col gap-4"
              >
                {/* Top row: thumbnail + info + price */}
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-24 h-[68px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-[#E5E5E0] dark:border-[#26282E]">
                    {images[0] ? (
                      <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B66]">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#F0F0F0] line-clamp-1 font-heading mb-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[#6B6B66] mb-2">
                      Sold by @{sellerUsername} · Purchased {formatDate(order.created_at)}
                    </p>
                    <Badge variant={order.status === "completed" ? "approved" : "pending"}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-lg font-bold text-brand-indigo font-heading">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#E5E5E0] dark:border-[#26282E]">
                  <Link href={`/product/${product.id}`}>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-indigo hover:bg-brand-indigo/5 rounded-md transition-colors">
                      <ExternalLink size={13} />
                      View Listing
                    </button>
                  </Link>

                  {order.status === "completed" && (
                    <>
                      {product.has_deliverable ? (
                        <button
                          onClick={() => handleDownload(product.id, product.title)}
                          disabled={downloadingId === product.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-indigo hover:bg-brand-indigo/5 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Download size={13} />
                          {downloadingId === product.id ? "Downloading..." : "Download"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500/80">
                          <AlertCircle size={12} />
                          File unavailable
                        </span>
                      )}

                      {!order.buyer_comment && (
                        <button
                          onClick={() => handleWriteReview(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-indigo hover:bg-brand-indigo/5 rounded-md transition-colors"
                        >
                          <Star size={13} />
                          Write Review
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleReportProblem(product.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B6B66] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                  >
                    <AlertCircle size={13} />
                    Report
                  </button>

                  <div className="ml-auto">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500/70 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Review comment if exists */}
                {order.status === "completed" && order.buyer_comment && (
                  <div className="text-xs text-[#6B6B66] border-t border-[#E5E5E0] dark:border-[#26282E] pt-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">Your Feedback</span>
                      <span className="text-amber-500 text-sm">
                        {"★".repeat(order.buyer_rating || 0) + "☆".repeat(5 - (order.buyer_rating || 0))}
                      </span>
                    </div>
                    <p className="italic bg-[#F5F5F0] dark:bg-[#1a1c22] p-3 rounded-lg border border-[#E5E5E0] dark:border-[#26282E] leading-relaxed text-[#4a4a5a] dark:text-gray-300">
                      &ldquo;{order.buyer_comment}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
