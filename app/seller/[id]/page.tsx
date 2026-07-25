"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface BackendProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  user: {
    email: string;
    role: string;
    created_at: string;
  };
}

/** Helper to normalise product to shape expected by ProductCard */
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

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();

  const [seller, setSeller] = useState<BackendProfile | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      const token = localStorage.getItem("campusly_access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch seller profile
        const profileRes = await fetch(`${API_BASE_URL}/users/${id}`, { headers });
        if (!profileRes.ok) {
          throw new Error("Failed to load profile");
        }
        const profileData = await profileRes.json();
        setSeller(profileData);

        // Fetch seller's active (approved) listings
        const productsRes = await fetch(
          `${API_BASE_URL}/products?seller_id=${id}&status=approved`
        );
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setListings(productsData.map(normalise));
        }
      } catch (err) {
        console.error("Failed to load seller page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
            Seller not found or you are not logged in
          </h1>
          <Link href="/" className="text-brand-indigo hover:underline text-sm">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const avatar = seller.avatar_url ?? "/default-avatar.svg";

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-card dark:bg-card-dark border-b border-border-soft dark:border-border-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={avatar}
                alt={seller.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-card-dark shadow-card"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
                    {seller.name}
                  </h1>
                  <VerifiedBadge isVerified={seller.is_verified} size="md" />
                </div>
                <p className="text-text-muted text-sm mb-2">@{seller.username}</p>
                <div className="mt-2">
                  <p className="text-text-body dark:text-gray-300 text-sm max-w-xl leading-relaxed bg-gray-50 dark:bg-gray-800/40 px-3.5 py-2 rounded-xl border border-border-soft dark:border-border-dark inline-block">
                    {seller.bio?.trim() ? seller.bio : "No bio provided yet."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
                  <Calendar size={13} />
                  <span>Member since {formatDate(seller.user.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <div className="text-2xl font-bold font-heading text-brand-indigo">
                  {listings.length}
                </div>
                <div className="text-xs text-text-muted">
                  active listing{listings.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-lg font-semibold font-heading text-text-primary dark:text-gray-100 mb-6">
            Active Listings
          </h2>

          {listings.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={48} />}
              title="No active listings"
              description="This seller doesn't have any active listings right now. Check back later."
              action={{ label: "Browse all listings", onClick: () => router.push("/") }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
