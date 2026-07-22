"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";

type CheckoutState = "form" | "processing" | "success" | "error";

interface BackendProduct {
  id: string;
  title: string;
  price: number;
  status: string;
  images: { id: string; image_url: string }[];
  seller: {
    id: string;
    profile: {
      username: string;
      name: string;
    } | null;
  };
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();
  const [state, setState] = useState<CheckoutState>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const clean = input.replace(/[^\d ]/g, "");
    const digits = clean.replace(/\s/g, "");
    const limitedDigits = digits.slice(0, 16);
    
    const parts = [];
    for (let i = 0; i < limitedDigits.length; i += 4) {
      parts.push(limitedDigits.slice(i, i + 4));
    }
    
    let formatted = parts.join(" ");
    if (input.endsWith(" ") && (limitedDigits.length % 4 === 0) && limitedDigits.length < 16) {
      formatted += " ";
    }
    
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const clean = input.replace(/[^\d/]/g, "");
    const digits = clean.replace(/\D/g, "");
    
    let formatted = "";
    if (digits.length > 0) {
      const month = digits.slice(0, 2);
      const year = digits.slice(2, 4);
      
      if (digits.length > 2) {
        formatted = `${month}/${year}`;
      } else if (digits.length === 2) {
        if (input.endsWith("/")) {
          formatted = `${month}/`;
        } else {
          formatted = month;
        }
      } else {
        formatted = month;
      }
    }
    
    setExpiry(formatted);
  };

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3002/products/${id}`);
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  if (!product || !user) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
            {!user ? "Please log in to continue" : "Product not found"}
          </h1>
          <Link href={!user ? "/login" : "/"} className="text-brand-indigo hover:underline text-sm">
            {!user ? "Go to login" : "Back to marketplace"}
          </Link>
        </div>
      </div>
    );
  }

  if (product.seller.id === user.id) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
        <Navbar darkMode={darkMode} toggleDark={toggleDark} />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-10 max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-5 border border-red-200 dark:border-red-900">
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
              Cannot purchase own listing
            </h1>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              You are the seller of <strong>{product.title}</strong>. You cannot buy your own product.
            </p>
            <div className="flex flex-col gap-3">
              <Link href={`/dashboard/listings/${product.id}/edit`}>
                <Button fullWidth>Edit Listing</Button>
              </Link>
              <Link href={`/product/${product.id}`}>
                <Button variant="ghost" fullWidth>
                  Back to Listing
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("processing");
    setErrorMsg("");

    const token = localStorage.getItem("campusly_access_token");
    if (!token) {
      setErrorMsg("Authentication required.");
      setState("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:3002/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: id }),
      });

      if (res.ok) {
        setState("success");
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || "Failed to process transaction.");
        setState("error");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  const images = product.images.map((img) => img.image_url);
  const sellerUsername = product.seller.profile?.username ?? "unknown";

  if (state === "success") {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
        <Navbar darkMode={darkMode} toggleDark={toggleDark} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-10 max-w-md w-full text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100 mb-2">
              Purchase complete!
            </h1>
            <p className="text-text-muted text-sm mb-2">
              You&apos;ve successfully purchased:
            </p>
            <p className="font-semibold text-text-primary dark:text-gray-100 mb-1">
              {product.title}
            </p>
            <p className="text-brand-indigo font-bold text-lg mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-text-muted mb-6">
              A receipt has been sent to {user.email}. Access your purchase from My Purchases in your dashboard.
            </p>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => router.push("/dashboard/purchases")}>
                View My Purchases
              </Button>
              <Button variant="ghost" fullWidth onClick={() => router.push("/")}>
                Back to Marketplace
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href={`/product/${id}`} className="hover:text-brand-indigo transition-colors flex items-center gap-1">
            <ChevronLeft size={14} />
            Back to listing
          </Link>
        </nav>

        <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100 mb-8">
          Complete your purchase
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 order-first md:order-last">
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5 sticky top-24">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                Order Summary
              </h2>
              <div className="flex gap-3 mb-4">
                {images[0] && (
                  <img
                    src={images[0]}
                    alt={product.title}
                    className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-border-soft"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary dark:text-gray-100 line-clamp-2 leading-snug">
                    {product.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Sold by @{sellerUsername}
                  </p>
                </div>
              </div>
              <div className="border-t border-border-soft dark:border-border-dark pt-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-text-muted">Subtotal</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-text-muted">Platform fee</span>
                  <span>ETB 0</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-text-primary dark:text-gray-100">Total</span>
                  <span className="text-brand-indigo text-lg">{formatPrice(product.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-5">
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-brand-indigo" />
                <h2 className="text-base font-semibold font-heading text-text-primary dark:text-gray-100">
                  Payment Details
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    required
                  />
                  <Input
                    label="CVC"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    maxLength={4}
                    required
                    type="password"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border-soft dark:border-border-dark text-xs text-text-muted">
                <Lock size={12} className="text-brand-indigo flex-shrink-0" />
                <span>
                  Your payment information is encrypted and processed securely. Campusly never stores your card details.
                </span>
              </div>
            </div>

            {state === "error" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-btn text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-0.5">Payment failed</p>
                  <p className="text-xs opacity-80">
                    {errorMsg || "Your card was declined. Please check your details and try again, or use a different card."}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={state === "processing"}
            >
              {state === "processing"
                ? "Processing…"
                : state === "error"
                ? "Retry Payment"
                : `Confirm Purchase — ${formatPrice(product.price)}`}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
