"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ExternalLink, Download, Trash2, AlertCircle, Star } from "lucide-react";
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
      } catch {
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
        <Spinner size="lg" className="text-[#2E3192]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold font-heading text-gray-900 dark:text-gray-100 leading-tight">
          My Purchases
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
                className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xs"
              >
                {/* Top Row: Thumbnail + Details + Price */}
                <div className="flex items-start gap-3 sm:gap-4 justify-between">
                  
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 flex-shrink-0 border border-[#E5E5E0] dark:border-[#26282E]">
                      {images[0] ? (
                        <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 font-heading">
                        {product.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate">
                        Sold by @{sellerUsername} • {formatDate(order.created_at)}
                      </p>
                      <div>
                        <Badge variant={order.status === "completed" ? "approved" : "pending"}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs sm:text-base font-extrabold text-[#2E3192] dark:text-indigo-400 font-heading">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Actions Row - Clean wrapping on mobile screens */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5E5E0] dark:border-[#26282E]">
                  <Link href={`/product/${product.id}`}>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3192] bg-[#2E3192]/10 hover:bg-[#2E3192]/20 rounded-xl transition-colors cursor-pointer">
                      <ExternalLink size={13} />
                      <span>View Listing</span>
                    </button>
                  </Link>

                  {order.status === "completed" && (
                    <>
                      {product.has_deliverable ? (
                        <button
                          onClick={() => handleDownload(product.id, product.title)}
                          disabled={downloadingId === product.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Download size={13} />
                          <span>{downloadingId === product.id ? "Downloading..." : "Download"}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50">
                          <AlertCircle size={12} />
                          <span>File unavailable</span>
                        </span>
                      )}

                      {!order.buyer_comment && (
                        <button
                          onClick={() => handleWriteReview(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Star size={13} />
                          <span>Write Review</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleReportProblem(product.title)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <AlertCircle size={13} />
                    <span>Report</span>
                  </button>

                  <button
                    onClick={() => handleDelete(order.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer ml-auto"
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Review Comment if submitted */}
                {order.status === "completed" && order.buyer_comment && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-[#E5E5E0] dark:border-[#26282E] pt-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Your Review</span>
                      <span className="text-amber-500 text-sm">
                        {"★".repeat(order.buyer_rating || 0) + "☆".repeat(5 - (order.buyer_rating || 0))}
                      </span>
                    </div>
                    <p className="italic bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 leading-relaxed text-gray-700 dark:text-gray-300">
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
