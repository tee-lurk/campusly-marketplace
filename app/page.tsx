"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductCardSkeleton } from "@/components/marketplace/ProductCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { FilterState, Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";
import { Shield } from "lucide-react";

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
  const searchParams = useSearchParams();
  const { darkMode, toggleDark } = useTheme();
  const { user } = useAuth();

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

  // Client-side sort with user's own listings prioritized at the top
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

    // Always bring seller's own listings to the front
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

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar
        onSearch={handleSearch}
        searchValue={searchInput}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />

      <main className="flex-1">
        {/* Trust Banner */}
        <div className="bg-brand-indigo/5 dark:bg-brand-indigo/10 border-b border-brand-indigo/10 dark:border-brand-indigo/20 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-brand-indigo">
            <Shield size={13} />
            <span>All listings are reviewed by our team before being published.</span>
          </div>
        </div>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
              Academic Marketplace
            </h1>
            <p className="text-text-muted text-base">
              Discover notes, modules, past papers, and video lectures from verified students.
            </p>
          </div>

          {/* Filter bar */}
          <FilterBar filters={filters} onChange={setFilters} />
        </section>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={<Search size={48} />}
              title="No listings found"
              description="Try adjusting your filters or search term. New materials are added regularly."
              action={{
                label: "Clear filters",
                onClick: () =>
                  setFilters({ category: "", productType: "", sort: "newest", search: "" }),
              }}
            />
          ) : (
            <>
              <p className="text-sm text-text-muted mb-4">
                {sorted.length} listing{sorted.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => p + 1)}
                    size="lg"
                  >
                    Load more listings
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
    <Suspense>
      <MarketplaceFeedInner />
    </Suspense>
  );
}
