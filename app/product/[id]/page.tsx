"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  ClipboardList,
  Video,
  Flag,
  Shield,
  Download,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { API_BASE_URL } from "@/lib/api";

const productTypeLabels: Record<string, string> = {
  module: "Module",
  notes: "Lecture Notes",
  "past-exam": "Past Exam",
  "video-lecture": "Video Lecture",
};

const productTypeIcons: Record<string, React.ReactNode> = {
  module: <BookOpen size={40} className="text-[#2E3192] opacity-50" />,
  notes: <FileText size={40} className="text-[#2E3192] opacity-50" />,
  "past-exam": <ClipboardList size={40} className="text-[#2E3192] opacity-50" />,
  "video-lecture": <Video size={40} className="text-[#2E3192] opacity-50" />,
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

  const handlePrevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

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
      <div className="min-h-screen bg-[#FDFBF5] dark:bg-[#18181C] flex items-center justify-center">
        <Spinner size="lg" className="text-[#2E3192]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF5] dark:bg-[#18181C] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-card-dark border border-[#E5E5E0] dark:border-[#26282E] p-8 rounded-2xl shadow-xs max-w-md">
          <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-2">
            Listing not found
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            This study material may have been deleted or is temporarily unavailable.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2E3192] hover:bg-[#2E3192]/90 px-4 py-2 rounded-xl transition-all">
            <ArrowLeft size={14} />
            <span>Back to Marketplace</span>
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
    <div className="min-h-screen bg-[#FDFBF5] dark:bg-[#18181C] text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-x-hidden">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#2E3192] transition-colors flex items-center gap-1 font-medium">
            <ChevronLeft size={14} />
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-300 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Grid Layout (2 Columns on Desktop, Single Column on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Image Gallery & Description */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            {/* Main Interactive Image Viewer with Left / Right Arrows */}
            <div className="relative bg-slate-100 dark:bg-gray-800 rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-video flex items-center justify-center border border-[#E5E5E0] dark:border-[#26282E] shadow-2xs group">
              {hasImages ? (
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {productTypeIcons[productTypeName] ?? <BookOpen size={40} className="text-[#2E3192] opacity-50" />}
                  <span className="text-xs font-medium text-gray-400">No preview available</span>
                </div>
              )}

              {/* Video Play Overlay */}
              {productTypeName === "video-lecture" && hasImages && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center">
                    <Play size={22} fill="#2E3192" className="text-[#2E3192] ml-1" />
                  </div>
                </div>
              )}

              {/* LEFT & RIGHT NAVIGATION ARROWS */}
              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-xs z-10">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImage === i
                        ? "border-[#2E3192] ring-2 ring-[#2E3192]/20 shadow-sm"
                        : "border-[#E5E5E0] dark:border-[#26282E] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* MOBILE ONLY: Buy Card displayed right below images on phones so users don't have to scroll */}
            <div className="block lg:hidden">
              <BuyCard
                product={product}
                user={user}
                buying={buying}
                downloading={downloading}
                handleBuyNow={handleBuyNow}
                handleDownload={handleDownload}
                productTypeName={productTypeName}
              />
            </div>

            {/* Product Description */}
            <div className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-gray-100">
                About this listing
              </h2>
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>

              {/* Report Listing */}
              <div className="pt-4 border-t border-[#E5E5E0] dark:border-[#26282E] flex justify-end">
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Flag size={13} />
                  <span>Report this listing</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Desktop Sticky Buy Panel & Seller Card */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* DESKTOP ONLY: Buy Card */}
            <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
              <BuyCard
                product={product}
                user={user}
                buying={buying}
                downloading={downloading}
                handleBuyNow={handleBuyNow}
                handleDownload={handleDownload}
                productTypeName={productTypeName}
              />

              {/* Seller Card */}
              <SellerCard product={product} sellerAvatar={sellerAvatar} sellerProfile={sellerProfile} />
            </div>

            {/* MOBILE ONLY: Seller Card */}
            <div className="block lg:hidden">
              <SellerCard product={product} sellerAvatar={sellerAvatar} sellerProfile={sellerProfile} />
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

{/* Buy Action Card Sub-Component */}
function BuyCard({
  product,
  user,
  buying,
  downloading,
  handleBuyNow,
  handleDownload,
  productTypeName,
}: {
  product: BackendProduct;
  user: any;
  buying: boolean;
  downloading: boolean;
  handleBuyNow: () => void;
  handleDownload: () => void;
  productTypeName: string;
}) {
  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Category Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2E3192]/10 text-[#2E3192] dark:bg-[#2E3192]/20 dark:text-indigo-300">
          {product.category.name}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {productTypeLabels[productTypeName] ?? productTypeName}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-gray-100 leading-snug">
        {product.title}
      </h1>

      {/* Price */}
      <div className="text-2xl sm:text-3xl font-extrabold text-[#2E3192] dark:text-indigo-400 font-heading">
        {formatPrice(product.price)}
      </div>

      {/* Previous Purchase Notice */}
      {product.has_purchased && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 flex gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-xs">You already bought this item!</p>
            <p className="leading-relaxed opacity-90 text-[11px]">
              Purchased {product.purchased_at ? formatDate(product.purchased_at) : "previously"}. Download directly below anytime.
            </p>
          </div>
        </div>
      )}

      {/* Buy Now / Download Button */}
      {user && user.id === product.seller.id ? (
        <Link href={`/dashboard/listings/${product.id}/edit`} className="w-full block">
          <Button fullWidth size="lg" variant="secondary" className="font-semibold text-xs sm:text-sm">
            This is your listing — Edit Listing
          </Button>
        </Link>
      ) : product.has_purchased ? (
        <div className="flex flex-col gap-2.5">
          <Button fullWidth size="lg" onClick={handleDownload} loading={downloading} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Download size={16} />
            <span>{downloading ? "Downloading..." : "Download File"}</span>
          </Button>
          <Button fullWidth variant="secondary" size="sm" loading={buying} onClick={handleBuyNow}>
            Buy Again
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button fullWidth size="lg" loading={buying} onClick={handleBuyNow} className="bg-[#2E3192] hover:bg-[#2E3192]/90 font-bold shadow-xs">
            {user ? "Buy Now" : "Buy Now — Sign in required"}
          </Button>
          {!user && (
            <p className="text-[11px] text-gray-400 text-center">
              You'll be prompted to sign in before checkout
            </p>
          )}
        </div>
      )}

      {/* Trust Signal */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#E5E5E0] dark:border-[#26282E] text-xs text-gray-400">
        <Shield size={14} className="text-[#2E3192] dark:text-indigo-400 flex-shrink-0" />
        <span>Reviewed and approved before publishing</span>
      </div>
    </div>
  );
}

{/* Seller Info Card Sub-Component */}
function SellerCard({
  product,
  sellerAvatar,
  sellerProfile,
}: {
  product: BackendProduct;
  sellerAvatar: string;
  sellerProfile: any;
}) {
  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-5 shadow-2xs space-y-3">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Seller Info
      </h3>

      <div className="flex items-center gap-3">
        <img
          src={sellerAvatar}
          alt={sellerProfile?.username ?? "seller"}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {sellerProfile?.name ?? "Unknown"}
            </span>
            {sellerProfile?.is_verified && <VerifiedBadge isVerified={true} showText={false} size="sm" />}
          </div>
          <p className="text-xs text-gray-500 truncate">@{sellerProfile?.username ?? "unknown"}</p>
        </div>
      </div>

      <Link href={`/seller/${product.seller.id}`} className="block pt-1">
        <Button variant="ghost" size="sm" fullWidth className="border border-[#E5E5E0] dark:border-[#26282E] text-xs font-semibold text-gray-700 dark:text-gray-300">
          View seller's listings
        </Button>
      </Link>
    </div>
  );
}
