"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ChevronLeft,
  FileText,
  BookOpen,
  ClipboardList,
  Video,
  Flag,
  Shield,
  Download,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { AuthModal } from "@/components/shared/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice, formatDate } from "@/lib/utils";
import { ProductType } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";

const productTypeLabels: Record<string, string> = {
  module: "Module",
  notes: "Lecture Notes",
  "past-exam": "Past Exam",
  "video-lecture": "Video Lecture",
};

const productTypeIcons: Record<string, React.ReactNode> = {
  module: <BookOpen size={40} className="text-brand-indigo opacity-50" />,
  notes: <FileText size={40} className="text-brand-indigo opacity-50" />,
  "past-exam": <ClipboardList size={40} className="text-brand-indigo opacity-50" />,
  "video-lecture": <Video size={40} className="text-brand-indigo opacity-50" />,
};

interface BackendProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  has_purchased?: boolean;
  purchased_at?: string;
  created_at: string;
  category: { id: string; name: string };
  productType: { id: string; name: string };
  images: { id: string; image_url: string }[];
  seller: {
    id: string;
    profile: {
      name: string;
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
    } | null;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [buying, setBuying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("campusly_access_token");
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setProduct(await res.json());
        } else {
          setProduct(null);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem("campusly_access_token");
      const res = await fetch(`${API_BASE_URL}/products/${product.id}/download`, {
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
        const cleanTitle = product.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
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
      setDownloading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setBuying(true);
    setTimeout(() => {
      setBuying(false);
      router.push(`/product/${id}/checkout`);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
            Listing not found
          </h1>
          <Link href="/" className="text-brand-indigo hover:underline text-sm">
            ← Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.map((img) => img.image_url);
  const hasImages = images.length > 0;
  const productTypeName = product.productType.name;
  const sellerProfile = product.seller.profile;
  const sellerAvatar = sellerProfile?.avatar_url ?? "/default-avatar.svg";

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-brand-indigo transition-colors flex items-center gap-1">
            <ChevronLeft size={14} />
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-text-body dark:text-gray-300 truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Media */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Main image */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-border-soft dark:border-border-dark">
              {hasImages ? (
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {productTypeIcons[productTypeName] ?? <BookOpen size={40} className="text-brand-indigo opacity-50" />}
                  <span className="text-sm text-text-muted">No preview available</span>
                </div>
              )}

              {productTypeName === "video-lecture" && hasImages && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play size={24} fill="#2E3192" className="text-brand-indigo ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === i
                        ? "border-brand-indigo"
                        : "border-border-soft dark:border-border-dark opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold font-heading text-text-primary dark:text-gray-100 mb-3">
                About this listing
              </h2>
              <div className="prose-content text-text-body dark:text-gray-300">
                {product.description.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0 leading-[1.75]">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Report link */}
            <div className="mt-8 pt-6 border-t border-border-soft dark:border-border-dark">
              <button className="text-xs text-text-muted hover:text-red-400 transition-colors flex items-center gap-1.5">
                <Flag size={12} />
                Report this listing
              </button>
            </div>
          </div>

          {/* Right: Sticky panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="indigo">{product.category.name}</Badge>
                  <Badge variant="muted">{productTypeLabels[productTypeName] ?? productTypeName}</Badge>
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold font-heading text-text-primary dark:text-gray-100 mb-3 leading-snug">
                  {product.title}
                </h1>

                {/* Price */}
                <div className="text-3xl font-bold text-brand-indigo font-heading mb-5">
                  {formatPrice(product.price)}
                </div>

                {/* Previous Purchase Warning Banner */}
                {product.has_purchased && (
                  <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 flex gap-3 text-amber-800 dark:text-amber-200 mb-4 animate-slide-up">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-xs">You already bought this item!</p>
                      <p className="leading-relaxed opacity-90 text-[11px]">
                        Purchased {product.purchased_at ? formatDate(product.purchased_at) : "previously"}. You can download your file directly below or access it anytime in My Purchases.
                      </p>
                    </div>
                  </div>
                )}

                {/* Buy Now / Download Actions */}
                {user && user.id === product.seller.id ? (
                  <Link href={`/dashboard/listings/${product.id}/edit`} className="w-full block">
                    <Button fullWidth size="lg" variant="secondary">
                      This is your listing — Edit Listing
                    </Button>
                  </Link>
                ) : product.has_purchased ? (
                  <div className="flex flex-col gap-2.5">
                    <Button fullWidth size="lg" onClick={handleDownload} loading={downloading} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download size={16} />
                      {downloading ? "Downloading..." : "Download File"}
                    </Button>
                    <Button fullWidth variant="secondary" size="sm" loading={buying} onClick={handleBuyNow}>
                      Buy Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button fullWidth size="lg" loading={buying} onClick={handleBuyNow}>
                      {user ? "Buy Now" : "Buy Now — Sign in required"}
                    </Button>
                    {!user && (
                      <p className="text-xs text-text-muted text-center mt-2">
                        You&apos;ll be prompted to log in
                      </p>
                    )}
                  </>
                )}

                {/* Trust signal */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-soft dark:border-border-dark text-xs text-text-muted">
                  <Shield size={13} className="text-brand-indigo flex-shrink-0" />
                  <span>This listing was reviewed and approved before publishing.</span>
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Seller
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={sellerAvatar}
                    alt={sellerProfile?.username ?? "seller"}
                    className="w-10 h-10 rounded-full object-cover border border-border-soft"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary dark:text-gray-100 truncate">
                        {sellerProfile?.name ?? "Unknown"}
                      </span>
                      {sellerProfile?.is_verified && <VerifiedBadge isVerified={true} showText={false} size="sm" />}
                    </div>
                    <p className="text-xs text-text-muted">@{sellerProfile?.username ?? "unknown"}</p>
                  </div>
                </div>

                <Link href={`/seller/${product.seller.id}`}>
                  <Button variant="ghost" size="sm" fullWidth className="mt-3">
                    View seller&apos;s listings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectAfter={`/product/${product.id}/checkout`}
      />
    </div>
  );
}
