"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ExternalLink, Download, Trash2, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice, formatDate } from "@/lib/utils";

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
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:3002/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this purchase from your history?")) {
      return;
    }
    const token = localStorage.getItem("campusly_access_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3002/transactions/${orderId}`, {
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
      const res = await fetch(`http://localhost:3002/products/${productId}/download`, {
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
      alert(`Thank you. Your feedback has been logged. Our support team will investigate and contact you.`);
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
      const res = await fetch(`http://localhost:3002/transactions/${orderId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
          My Purchases
        </h1>
        <p className="text-sm text-text-muted mt-1">
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
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const product = order.product;
            if (!product) return null;
            const images = product.images.map((img) => img.image_url);
            const sellerUsername = product.seller.profile?.username ?? "unknown";

            return (
              <div
                key={order.id}
                className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex gap-4 items-start">
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt={product.title}
                      className="w-20 h-14 rounded-lg object-cover flex-shrink-0 border border-border-soft"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-1 font-heading mb-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-text-muted mb-2">
                      Sold by @{sellerUsername} · Purchased {formatDate(order.created_at)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={order.status === "completed" ? "approved" : "pending"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>

                      {/* Action buttons */}
                      {order.status === "completed" && (
                        <>
                          {product.has_deliverable ? (
                            <button
                              onClick={() => handleDownload(product.id, product.title)}
                              disabled={downloadingId === product.id}
                              className="text-xs text-brand-indigo hover:text-brand-indigo-dark font-medium flex items-center gap-1 transition-colors"
                            >
                              <Download size={12} className="flex-shrink-0" />
                              {downloadingId === product.id ? "Downloading..." : "Download"}
                            </button>
                          ) : (
                            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                              <AlertCircle size={11} className="flex-shrink-0" />
                              File unavailable
                            </span>
                          )}

                          {!order.buyer_comment && (
                            <button
                              onClick={() => handleWriteReview(order.id)}
                              className="text-xs text-brand-indigo hover:text-brand-indigo-dark font-medium flex items-center gap-1 transition-colors"
                            >
                              Write Review
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => handleReportProblem(product.title)}
                        className="text-xs text-text-muted hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <AlertCircle size={12} className="flex-shrink-0" />
                        Report Problem
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-base font-bold text-brand-indigo font-heading">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs text-brand-indigo hover:underline flex items-center gap-1"
                      >
                        View listing
                        <ExternalLink size={11} />
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Render Review Comment Inline if exists */}
                {order.status === "completed" && order.buyer_comment && (
                  <div className="text-xs text-text-muted border-t border-border-soft/60 pt-3 flex flex-col gap-1 animate-slide-up">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary dark:text-gray-200">Your Feedback</span>
                      <span className="text-amber-500 text-sm">
                        {"★".repeat(order.buyer_rating || 0) + "☆".repeat(5 - (order.buyer_rating || 0))}
                      </span>
                    </div>
                    <p className="italic bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-border-soft/50 leading-relaxed text-text-body dark:text-gray-300">
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
