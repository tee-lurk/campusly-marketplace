"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Send,
  Wifi,
  Split,
  Plus,
  Home,
  Briefcase,
  Plane,
  ArrowRightCircle,
  CreditCard,
  Users,
  Settings,
  AlertTriangle,
  Receipt,
  LogOut,
  LogIn
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

// --- Types ---
interface Stats {
  totalListings: number;
  pendingCount: number;
  totalUsers: number;
  completedTransactions: number;
  totalRevenue: number;
}

interface TimeseriesPoint {
  date: string;
  listingsCount: number;
  transactionsCount: number;
}

interface ActivityItem {
  id: string;
  type: "listing" | "transaction" | "report" | "login" | "logout";
  description: string;
  timestamp: string;
  relatedId: string;
}

// --- Custom Charts ---

function SplitBarChart({ data }: { data: TimeseriesPoint[] }) {
  if (!data.length) return null;
  const W = 600;
  const H = 220;
  const PAD = { top: 20, right: 10, bottom: 30, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map(d => Math.max(d.listingsCount, d.transactionsCount)), 1) * 1.1; // Add 10% headroom

  const barW = Math.min((chartW / data.length) * 0.35, 14); // width of a single bar
  const groupW = barW * 2 + 4; // width of both bars + gap
  const labelInterval = data.length > 14 ? 5 : data.length > 7 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines (horizontal) */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + chartH * (1 - frac);
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400 font-medium" fontSize={10}>
              {Math.round(maxVal * frac)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const xStep = chartW / Math.max(data.length - 1, 1);
        const x = PAD.left + i * xStep;

        const h1 = (d.listingsCount / maxVal) * chartH;
        const y1 = PAD.top + chartH - h1;

        const h2 = (d.transactionsCount / maxVal) * chartH;
        const y2 = PAD.top + chartH - h2;

        return (
          <g key={i}>
            {/* Listing Bar (Dark Blue) */}
            <rect 
              x={x - groupW/2} 
              y={y1} 
              width={barW} 
              height={h1} 
              fill="#3b82f6" 
              rx={3} 
            />
            {/* Transaction Bar (Light Blue) */}
            <rect 
              x={x - groupW/2 + barW + 2} 
              y={y2} 
              width={barW} 
              height={h2} 
              fill="#93c5fd" 
              rx={3} 
            />
          </g>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== data.length - 1) return null;
        const xStep = chartW / Math.max(data.length - 1, 1);
        const x = PAD.left + i * xStep;
        const label = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
        return (
          <text key={i} x={x} y={H - 5} textAnchor="middle" className="fill-gray-400 font-medium" fontSize={10}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function DonutChart({ values, labels, colors, total }: { values: number[], labels: string[], colors: string[], total: number }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 24;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  let currentOffset = circ; // SVG dashoffset draws backwards

  return (
    <div className="relative w-40 h-40 mx-auto my-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {values.map((val, i) => {
          if (val === 0) return null;
          const strokeDasharray = `${circ} ${circ}`;
          const strokeDashoffset = currentOffset;
          const fillPerc = val / Math.max(total, 1);
          currentOffset -= (fillPerc * circ);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={colors[i]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap={fillPerc > 0.05 ? "round" : "butt"} // only round if piece is large enough
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total</span>
        <span className="text-xl font-bold text-gray-900 leading-tight">{total}</span>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [statsRes, tsRes, actRes] = await Promise.all([
        fetch("http://localhost:3002/admin/stats", { headers }),
        fetch("http://localhost:3002/admin/stats/timeseries?range=30d", { headers }),
        fetch(`http://localhost:3002/admin/activity/recent?filter=all&limit=15`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (tsRes.ok) setTimeseries(await tsRes.json());
      if (actRes.ok) setActivity(await actRes.json());

    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived calculations for right column donut chart
  const actListings = activity.filter(a => a.type === 'listing').length;
  const actTx = activity.filter(a => a.type === 'transaction').length;
  const actRep = activity.filter(a => a.type === 'report').length;
  const actTotal = actListings + actTx + actRep || 1; // avoid /0

  // Derived for timeline (simulate login/logout if empty just for visual match to design)
  const timelineActivity = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

  return (
    <div className="max-w-[1600px] mx-auto pt-2 pb-8 h-full overflow-y-auto custom-scrollbar">
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4 mx-4">
          {error}
        </div>
      )}

      {/* 3-Column Grid */}
      <div className="grid grid-cols-12 gap-6 px-4">
        
        {/* =========================================================
            LEFT COLUMN (25% -> col-span-3)
            ========================================================= */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
          
          {/* Identity Card */}
          <div className="bg-[#3b82f6] rounded-[20px] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute right-6 top-6 w-12 h-12 border-[6px] border-white/20 rounded-full pointer-events-none" />
            <div className="absolute right-9 top-9 w-6 h-6 border-[4px] border-white/40 rounded-full pointer-events-none" />
            <div className="absolute right-[42px] top-[42px] w-3 h-3 bg-white/80 rounded-full pointer-events-none" />

            <div className="mb-8">
              <div className="w-10 h-8 border border-white/30 rounded-md flex items-center justify-center opacity-80 mb-4">
                <CreditCard size={20} className="text-white" />
              </div>
              <div className="text-xs text-white/70 uppercase tracking-widest font-medium mb-1">Admin Dashboard</div>
              <div className="text-[22px] font-bold tracking-widest font-mono">**** **** **** {new Date().getFullYear()}</div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] text-white/70 uppercase tracking-widest mb-0.5">Platform Status</div>
                <div className="text-2xl font-bold">Active</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/70 uppercase tracking-widest mb-0.5">DATE</div>
                <div className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: '2-digit', year: '2-digit'})}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Users, label: "Users" },
              { icon: Receipt, label: "Orders" },
              { icon: AlertTriangle, label: "Reports" },
              { icon: Settings, label: "Settings" }
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                  <action.icon size={18} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>

          {/* System Health / Daily Limit */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900">System Health</h3>
              <MoreHorizontal size={18} className="text-gray-400" />
            </div>
            
            {/* Dashed progress bar simulation */}
            <div className="flex items-center gap-[2px] w-full h-2 mb-2">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className={`h-full flex-1 rounded-sm ${i < 28 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>
            
            <div className="flex justify-between text-[11px] font-medium text-gray-500">
              <span className="text-gray-900">Active • 70%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Platform Goals (Saving Plans equivalent) */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Platform Goals</h3>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900">
                <Plus size={12} /> Add Goal
              </button>
            </div>
            
            <div className="mb-2">
              <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1">Total Target</div>
              <div className="text-2xl font-bold text-gray-900">10,500</div>
            </div>

            {/* Goal Item 1 */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                    <Home size={12} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">Revenue Target</span>
                </div>
                <MoreHorizontal size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-[2px] w-full h-1.5 mb-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-sm ${i < 21 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-medium text-gray-500">
                <span>$7,000 • 70%</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Goal Item 2 */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                    <Briefcase size={12} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">New Users Target</span>
                </div>
                <MoreHorizontal size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-[2px] w-full h-1.5 mb-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-sm ${i < 22 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-medium text-gray-500">
                <span>4,500 • 75%</span>
                <span>6,000</span>
              </div>
            </div>
          </div>

        </div>


        {/* =========================================================
            MIDDLE COLUMN (50% -> col-span-6)
            ========================================================= */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            
            <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <Receipt size={14} />
                </div>
                <MoreHorizontal size={18} className="text-gray-400" />
              </div>
              <div className="text-[11px] font-medium text-gray-500 mb-1">Total Revenue</div>
              <div className="text-[22px] font-bold text-gray-900 mb-2">${loading ? "..." : stats?.totalRevenue.toLocaleString()}</div>
              <div className="text-[11px] font-medium text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">+500 (26%)</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <ArrowUpRight size={14} />
                </div>
                <MoreHorizontal size={18} className="text-gray-400" />
              </div>
              <div className="text-[11px] font-medium text-gray-500 mb-1">Completed Sales</div>
              <div className="text-[22px] font-bold text-gray-900 mb-2">{loading ? "..." : stats?.completedTransactions.toLocaleString()}</div>
              <div className="text-[11px] font-medium text-rose-500 bg-rose-50 w-fit px-2 py-0.5 rounded-full">-24 (11%)</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <Wallet size={14} />
                </div>
                <MoreHorizontal size={18} className="text-gray-400" />
              </div>
              <div className="text-[11px] font-medium text-gray-500 mb-1">Total Listings</div>
              <div className="text-[22px] font-bold text-gray-900 mb-2">{loading ? "..." : stats?.totalListings.toLocaleString()}</div>
              <div className="text-[11px] font-medium text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">+120 (70%)</div>
            </div>
            
          </div>

          {/* Bar Chart Section */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex flex-col flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">Platform Activity</h3>
                <div className="text-[11px] font-medium text-gray-500 mb-0.5">Total Balance</div>
                <div className="text-[22px] font-bold text-gray-900">34,970</div>
              </div>
              <div className="flex flex-col items-end gap-6">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 shadow-sm hover:bg-gray-50">
                  This Year <ChevronDown size={14} />
                </button>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-600">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#3b82f6]" /> Listings</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#93c5fd]" /> Transactions</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[220px]">
              {!loading && timeseries.length > 0 && <SplitBarChart data={timeseries} />}
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-bold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 shadow-sm hover:bg-gray-50">
                  This Week <ChevronDown size={14} />
                </button>
                <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 shadow-sm">
                  <Settings size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="pb-3 px-2 font-medium">Transaction Name ↕</th>
                    <th className="pb-3 px-2 font-medium">Date & Time ↕</th>
                    <th className="pb-3 px-2 font-medium">Amount ↕</th>
                    <th className="pb-3 px-2 font-medium">Note ↕</th>
                    <th className="pb-3 px-2 font-medium text-right">Status ↕</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                  ) : activity.filter(a => a.type === 'transaction').slice(0,5).map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-gray-900 text-[13px]">Sale Completed</div>
                        <div className="text-[11px] text-gray-500">Transaction</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-semibold text-gray-900 text-[13px]">{new Date(item.timestamp).toLocaleDateString('en-CA')}</div>
                        <div className="text-[11px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="py-3 px-2 font-bold text-gray-900 text-[13px]">
                        $65.99
                      </td>
                      <td className="py-3 px-2 text-[12px] text-gray-600 max-w-[150px] truncate">
                        {item.description}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-500 text-[10px] font-bold">
                          Successful
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && activity.filter(a => a.type === 'transaction').length === 0 && (
                     <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No recent transactions.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>


        {/* =========================================================
            RIGHT COLUMN (25% -> col-span-3)
            ========================================================= */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
          
          {/* Statistics Donut */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900">Statistics</h3>
              <button className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900">
                This Month <ChevronDown size={14} />
              </button>
            </div>
            
            <div className="flex border-b border-gray-100 mb-6">
              <div className="flex-1 pb-2 border-b-2 border-transparent text-center text-[11px] font-medium text-gray-500">Income • $7,000</div>
              <div className="flex-1 pb-2 border-b-2 border-blue-600 text-center text-[11px] font-bold text-gray-900">Activity • {actTotal}</div>
            </div>

            <DonutChart 
              values={[actListings, actTx, actRep]} 
              labels={["Listings", "Transactions", "Reports"]}
              colors={["#3b82f6", "#e0e7ff", "#fbcfe8"]}
              total={actTotal}
            />

            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#3b82f6]" />
                  <span className="font-semibold text-gray-700">Listings • {Math.round((actListings/actTotal)*100)}%</span>
                </div>
                <span className="font-bold text-gray-900">{actListings}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#e0e7ff]" />
                  <span className="font-semibold text-gray-700">Transactions • {Math.round((actTx/actTotal)*100)}%</span>
                </div>
                <span className="font-bold text-gray-900">{actTx}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#fbcfe8]" />
                  <span className="font-semibold text-gray-700">Reports • {Math.round((actRep/actTotal)*100)}%</span>
                </div>
                <span className="font-bold text-gray-900">{actRep}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-bold text-gray-900">Recent Activity</h3>
              <MoreHorizontal size={18} className="text-gray-400" />
            </div>

            <div className="text-[12px] font-bold text-gray-900 mb-4">Today</div>
            
            <div className="relative border-l border-gray-100 ml-4 pl-6 flex flex-col gap-6">
              {timelineActivity.length > 0 ? timelineActivity.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
                    {item.type === 'listing' ? <Home size={10} className="text-gray-500" /> : 
                     item.type === 'transaction' ? <CreditCard size={10} className="text-gray-500" /> : 
                     <AlertTriangle size={10} className="text-gray-500" />}
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900 leading-tight mb-1">
                    {item.description}
                  </div>
                  <div className="text-[11px] font-medium text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-400 py-4">No recent activity.</div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
