"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Video, BookOpen, ClipboardList, Play, Star, User } from "lucide-react";
import { Product, ProductType } from "@/lib/types";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

const productTypeIcons: Record<ProductType, React.ReactNode> = {
  module: <BookOpen size={28} className="text-[#2E3192] opacity-60" />,
  notes: <FileText size={28} className="text-[#2E3192] opacity-60" />,
  "past-exam": <ClipboardList size={28} className="text-[#2E3192] opacity-60" />,
  "video-lecture": <Video size={28} className="text-[#2E3192] opacity-60" />,
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
    <Link href={`/product/${product.id}`} className="group block h-full">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`bg-white dark:bg-[#18181C] border rounded-2xl overflow-hidden transition-colors duration-200 h-full flex flex-col relative ${
          isMine
            ? "border-[#2E3192]/60 ring-2 ring-[#2E3192]/20 dark:ring-[#2E3192]/30 bg-gradient-to-b from-[#2E3192]/[0.03] via-white to-white dark:via-[#18181C] dark:to-[#18181C]"
            : "border-[#E5E5E0] dark:border-[#26282E] hover:border-[#2E3192]/40 shadow-2xs hover:shadow-md"
        }`}
      >
        {/* Fixed 16:9 Thumbnail Image Block */}
        <div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 dark:bg-gray-800">
              {productTypeIcons[product.productType]}
            </div>
          )}

          {/* Video play overlay */}
          {product.productType === "video-lecture" && hasImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <Play size={14} fill="white" className="text-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Category Pill with Backdrop Blur Overlay */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md bg-black/50 border border-white/20 shadow-2xs">
              {productTypeLabels[product.productType]}
            </span>
          </div>

          {/* Top Right Badges: Your Listing / Featured */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col items-end gap-1 z-10">
            {isMine && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold leading-tight bg-[#2E3192] text-white shadow-2xs border border-indigo-400/30">
                <User size={9} className="text-white" />
                <span className="hidden sm:inline">Your Listing</span>
                <span className="sm:hidden">Mine</span>
              </span>
            )}
            {product.isFeatured && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#F5A623] text-gray-900 shadow-2xs border border-amber-300/30">
                <Star size={9} fill="currentColor" />
                <span>Featured</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
          <div>
            {/* Category tag */}
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              {product.category}
            </p>

            {/* Title - Clean 2-line clamp */}
            <h3 className="text-xs sm:text-sm font-bold font-heading text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-[#2E3192] transition-colors">
              {product.title}
            </h3>
          </div>

          {/* Price + Seller Row */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[#E5E5E0] dark:border-[#26282E]">
            {/* Seller Info */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <img
                src={product.seller.avatar || "/default-avatar.svg"}
                alt={product.seller.username}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
              />
              <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">
                  @{product.seller.username}
                </span>
                {product.seller.isVerified && (
                  <VerifiedBadge isVerified={true} showText={false} size="sm" />
                )}
              </div>
            </div>

            {/* Price Bold in Indigo */}
            <span className="text-xs sm:text-base font-bold text-[#2E3192] dark:text-indigo-400 font-heading flex-shrink-0 ml-1.5">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
