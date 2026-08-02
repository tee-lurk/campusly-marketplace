"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search, BookOpen, Shield, RefreshCw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductCardSkeleton } from "@/components/marketplace/ProductCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { FilterState, Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";

const PAGE_SIZE = 8;
const API = API_BASE_URL;

/** Normalise a backend product into the Product shape ProductCard expects */
function normalise(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    price: p.price,
    status: p.status,
    category: p.category?.name ?? "",
    productType: p.productType?.name ?? "",
    images: (p.images ?? []).map((img: any) => img.image_url),
    isFeatured: p.isFeatured ?? false,
    createdAt: p.created_at,
    seller: {
      id: p.seller?.id ?? "",
      name: p.seller?.profile?.name ?? "Unknown",
      username: p.seller?.profile?.username ?? "unknown",
      avatar: p.seller?.profile?.avatar_url || "/default-avatar.svg",
      isVerified: p.seller?.profile?.is_verified ?? false,
      email: p.seller?.email ?? "",
      bio: p.seller?.profile?.bio ?? "",
      role: (p.seller?.role as any) ?? "student",
      memberSince: p.seller?.created_at ?? "",
    },
  };
}

function MarketplaceFeedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode, toggleDark } = useTheme();
  const { user, isLoading } = useAuth();

  // Redirect admin directly to overview
  useEffect(() => {
    if (!isLoading && user && user.role === "admin") {
      router.replace("/admin/overview");
    }
  }, [user, isLoading, router]);

  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get("category") as FilterState["category"]) || "",
    productType: "",
    sort: "newest",
    search: searchParams.get("search") || "",
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "approved" });
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category_name", filters.category);
      if (filters.productType) params.set("product_type_name", filters.productType);

      const res = await fetch(`${API}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.map(normalise));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.productType]);

  useEffect(() => {
    fetchProducts();
    setPage(1);
  }, [fetchProducts]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setFilters((f) => ({ ...f, search: query }));
  };

  // Client-side sort with user's own listings prioritized at top
  const sorted = useMemo(() => {
    let list = [...products];

    switch (filters.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    if (user?.id) {
      list.sort((a, b) => {
        const isMineA = a.seller?.id === user.id ? 1 : 0;
        const isMineB = b.seller?.id === user.id ? 1 : 0;
        return isMineB - isMineA;
      });
    }

    return list;
  }, [products, filters.sort, user?.id]);

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  if (isLoading || (user && user.role === "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF5] dark:bg-[#18181C]">
        <Spinner size="lg" className="text-[#2E3192]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF5] dark:bg-[#18181C] text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <Navbar
        onSearch={handleSearch}
        searchValue={searchInput}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />

      <main className="flex-1">
        {/* Subtle Academic Trust Banner */}
        <div className="bg-[#2E3192]/5 border-b border-[#2E3192]/10 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-[#2E3192] dark:text-indigo-300">
            <Shield size={14} className="text-[#2E3192] dark:text-indigo-400" />
            <span>Peer-to-peer university academic marketplace • All listings reviewed &amp; verified</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-gray-900 dark:text-gray-100">
              Academic Marketplace
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              Discover lecture notes, course modules, past exam solutions, and video lectures created by top students.
            </p>
          </div>

          {/* Interactive Custom Filter Bar */}
          <FilterBar filters={filters} onChange={setFilters} />
        </section>

        {/* Product Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#16181D] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl p-8 shadow-2xs max-w-lg mx-auto my-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-[#2E3192] dark:text-indigo-400 mb-4 shadow-xs">
                <Search size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                No matching materials found
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
                We couldn't find any listings matching your search or category filters. Try clearing your filters.
              </p>
              <button
                onClick={() => setFilters({ category: "", productType: "", sort: "newest", search: "" })}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2E3192] hover:bg-[#2E3192]/90 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <XCircle size={15} />
                <span>Clear All Filters</span>
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Showing <strong className="text-gray-900 dark:text-gray-100">{visible.length}</strong> of{" "}
                  <strong className="text-gray-900 dark:text-gray-100">{sorted.length}</strong> verified materials
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                  {visible.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: idx * 0.035, ease: "easeOut" }}
                      className="h-full"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => p + 1)}
                    size="lg"
                    className="border border-[#E5E5E0] dark:border-[#26282E] hover:bg-white dark:hover:bg-[#16181D] font-semibold text-xs text-gray-700 dark:text-gray-300"
                  >
                    Load More Materials
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function MarketplaceFeed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF5] dark:bg-[#18181C]">
        <Spinner size="lg" className="text-[#2E3192]" />
      </div>
    }>
      <MarketplaceFeedInner />
    </Suspense>
  );
}
