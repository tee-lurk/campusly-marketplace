"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Users, Award, ShoppingBag, Send, Star, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/api";

interface SalesTransaction {
  id: string;
  status: string;
  created_at: string;
  buyer_comment: string | null;
  buyer_rating: number | null;
  product: {
    id: string;
    title: string;
    price: number;
    status: string;
  };
  buyer: {
    id: string;
    profile: {
      name: string;
      username: string;
      avatar_url: string | null;
    } | null;
  };
}

interface ProductListing {
  id: string;
  status: string;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payout dialog states
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("campusly_access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [salesRes, listingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transactions/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/products/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (salesRes.ok) {
        setSales(await salesRes.json());
      }
      if (listingsRes.ok) {
        setListings(await listingsRes.json());
      }
    } catch (err) {
      console.error("Failed to load seller earnings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const completedSales = sales.filter((s) => s.status === "completed");
  
  // Calculate stats
  const totalEarnings = completedSales.reduce((sum, s) => sum + s.product.price, 0);
  const uniqueBuyers = new Set(completedSales.map((s) => s.buyer.id));
  const activeListings = listings.filter((l) => l.status !== "sold").length;
  
  // Filter reviews
  const reviews = sales.filter((s) => s.buyer_comment !== null && s.buyer_comment.trim() !== "");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }
    if (Number(withdrawAmount) > totalEarnings) {
      alert("Insufficient balance. You cannot withdraw more than your total earnings.");
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      alert(
        `Success! ETB ${Number(withdrawAmount).toFixed(
          2
        )} has been requested for transfer to ${bankName} account ${accountNumber} (${accountName}). It will be credited within 24 hours.`
      );
      setPayoutOpen(false);
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setWithdrawAmount("");
    }, 1500);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold font-heading text-[#1A1A18] dark:text-[#F0F0F0] leading-tight">
            My Earnings
          </h1>
          <p className="text-sm text-[#6B6B66] mt-1.5">
            Track your wallet, verify sales metrics, and view student feedback.
          </p>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-brand-indigo to-brand-indigo-dark text-white rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <DollarSign size={200} />
        </div>
        <div>
          <span className="text-sm uppercase tracking-wider text-slate-200 font-medium">
            Seller Wallet Balance
          </span>
          <div className="text-4xl font-extrabold font-heading mt-1 text-white">
            {formatPrice(totalEarnings)}
          </div>
          <p className="text-xs text-slate-300 mt-2 font-normal">
            Withdrawals are processed securely into bank accounts or mobile wallets.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setPayoutOpen(true)}
            disabled={totalEarnings <= 0}
            className="inline-flex items-center justify-center font-medium px-6 py-3 text-base rounded-btn bg-white text-brand-indigo hover:bg-brand-indigo-light hover:text-white transition-all select-none active:scale-[0.98] disabled:bg-white/50 disabled:text-brand-indigo/50 disabled:cursor-not-allowed"
          >
            Withdraw Balance
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="Total Sold Items"
          value={completedSales.length}
          icon={<ShoppingBag size={22} />}
          color="text-brand-indigo"
        />
        <StatCard
          label="Unique Customers"
          value={uniqueBuyers.size}
          icon={<Users size={22} />}
          color="text-emerald-500"
        />
        <StatCard
          label="Active Store Listings"
          value={activeListings}
          icon={<Award size={22} />}
          color="text-amber-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Sales History Log */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold font-heading text-text-primary dark:text-gray-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-indigo" />
            Recent Sales History
          </h2>
          
          {sales.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm border border-dashed border-border-soft rounded-xl">
              No sales logged yet. Once someone buys your listed material, it will appear here.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sales.map((sale) => {
                const buyerProfile = sale.buyer.profile;
                const buyerName = buyerProfile?.name ?? "Student Buyer";
                const buyerUsername = buyerProfile?.username ?? "unknown";

                return (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center p-4 rounded-lg border border-[#E5E5E0] dark:border-[#26282E] bg-[#FDFBF5] dark:bg-[#18181C] text-sm"
                  >
                    <div>
                      <p className="font-semibold text-text-primary dark:text-gray-200">
                        {sale.product.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <User size={12} />
                        Bought by {buyerName} (@{buyerUsername}) · {formatDate(sale.created_at)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-brand-indigo">
                        {formatPrice(sale.product.price)}
                      </p>
                      <Badge variant={sale.status === "completed" ? "approved" : "pending"}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Buyer Feedback Feed */}
        <div className="bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold font-heading text-text-primary dark:text-gray-100 flex items-center gap-2">
            <Star size={18} className="text-brand-indigo" />
            Buyer Comments &amp; Ratings
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm border border-dashed border-border-soft rounded-xl">
              No buyer comments or reviews available yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => {
                const buyerProfile = rev.buyer.profile;
                const buyerName = buyerProfile?.name ?? "Student Buyer";
                const buyerAvatar = buyerProfile?.avatar_url ?? "/default-avatar.svg";

                return (
                  <div
                    key={rev.id}
                    className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-border-soft/60"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={buyerAvatar}
                        alt={buyerName}
                        className="w-6 h-6 rounded-full object-cover border border-border-soft"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-primary dark:text-gray-200 truncate">
                          {buyerName}
                        </p>
                        <p className="text-[10px] text-text-muted">On {rev.product.title}</p>
                      </div>
                      <div className="text-amber-500 text-xs flex flex-shrink-0">
                        {"★".repeat(rev.buyer_rating || 0) + "☆".repeat(5 - (rev.buyer_rating || 0))}
                      </div>
                    </div>
                    <p className="text-xs italic text-text-body dark:text-gray-300 bg-white dark:bg-canvas-dark p-2 rounded border border-border-soft/50">
                      &ldquo;{rev.buyer_comment}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleWithdraw}
            className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <h3 className="text-lg font-bold font-heading text-text-primary dark:text-gray-100 flex items-center gap-2">
                <Send size={18} className="text-brand-indigo" />
                Request Withdrawal Payout
              </h3>
              <button
                type="button"
                className="text-text-muted hover:text-text-body p-1"
                onClick={() => setPayoutOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-muted leading-relaxed">
                Enter your payment coordinates below. Payouts are made instantly via Telebirr or bank transfer within 24 hours.
              </p>
              
              <Select
                label="Bank / Platform Provider"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                options={[
                  { value: "", label: "Select bank/platform" },
                  { value: "CBE", label: "Commercial Bank of Ethiopia (CBE)" },
                  { value: "Awash", label: "Awash International Bank" },
                  { value: "Dashen", label: "Dashen Bank" },
                  { value: "Telebirr", label: "Telebirr mobile money" },
                ]}
                required
              />

              <Input
                label="Account Number / Phone Number"
                placeholder="e.g. 1000123456789 or 0912345678"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />

              <Input
                label="Beneficiary Full Name"
                placeholder="Name listed on account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />

              <Input
                label={`Withdraw Amount (Max: ${formatPrice(totalEarnings)})`}
                placeholder="0.00"
                type="number"
                min="10"
                step="0.01"
                max={totalEarnings}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                inputPrefix="ETB"
              />
            </div>

            <div className="flex gap-3 justify-end border-t border-border-soft pt-4 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPayoutOpen(false)}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button type="submit" loading={withdrawing}>
                Confirm Withdrawal
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
