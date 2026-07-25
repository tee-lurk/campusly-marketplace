import React from "react";
import Link from "next/link";
import { FileText, Video, BookOpen, ClipboardList, Play, Star, User } from "lucide-react";
import { Product, ProductType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

const productTypeIcons: Record<ProductType, React.ReactNode> = {
  module: <BookOpen size={32} className="text-brand-indigo opacity-60" />,
  notes: <FileText size={32} className="text-brand-indigo opacity-60" />,
  "past-exam": <ClipboardList size={32} className="text-brand-indigo opacity-60" />,
  "video-lecture": <Video size={32} className="text-brand-indigo opacity-60" />,
};

const productTypeLabels: Record<ProductType, string> = {
  module: "Module",
  notes: "Notes",
  "past-exam": "Past Exam",
  "video-lecture": "Video Lecture",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const hasImage = product.images && product.images.length > 0;
  const isMine = !!(user && product.seller.id && user.id === product.seller.id);

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <article className={`bg-card dark:bg-card-dark border rounded-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover h-full flex flex-col relative ${
        isMine
          ? "border-brand-indigo/50 ring-2 ring-brand-indigo/30 dark:ring-brand-indigo/40 bg-gradient-to-b from-brand-indigo/[0.03] via-card to-card"
          : "border-border-soft dark:border-border-dark"
      }`}>
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex-shrink-0">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {productTypeIcons[product.productType]}
            </div>
          )}

          {/* Video play overlay */}
          {product.productType === "video-lecture" && hasImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <Play size={16} fill="white" className="text-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Product type pill */}
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="indigo" className="text-2xs">
              {productTypeLabels[product.productType]}
            </Badge>
          </div>

          {/* Top Right Badges: Your Listing / Featured */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
            {isMine && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight bg-brand-indigo text-white shadow-sm border border-indigo-400/30">
                <User size={9} className="text-white" />
                Your Listing
              </span>
            )}
            {product.isFeatured && (
              <Badge variant="amber" className="text-2xs">
                <Star size={10} fill="currentColor" />
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <p className="text-xs text-text-muted mb-1.5">{product.category}</p>

          {/* Title */}
          <h3 className="text-sm font-semibold text-text-primary dark:text-gray-100 leading-snug line-clamp-2 font-heading flex-1">
            {product.title}
          </h3>

          {/* Price + Seller row */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-border-soft dark:border-border-dark">
            {/* Seller */}
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={product.seller.avatar}
                alt={product.seller.username}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-text-muted truncate leading-none">
                  @{product.seller.username} {isMine && <span className="text-brand-indigo font-bold ml-0.5">(You)</span>}
                </span>
                {product.seller.isVerified && (
                  <VerifiedBadge isVerified={true} showText={false} size="sm" />
                )}
              </div>
            </div>

            {/* Price */}
            <span className="text-base font-bold text-brand-indigo font-heading flex-shrink-0 ml-2">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
