"use client";

import React from "react";
import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E0] dark:border-[#26282E] bg-[#FAFAF8] dark:bg-[#16181D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Campusly Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading font-extrabold text-[#2E3192] text-xl tracking-tight">
                Campusly
              </span>
            </Link>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Empowering university students to exchange lecture notes, modules, exam solutions, and academic resources in a trusted peer-to-peer marketplace.
            </p>

            {/* Trust Signal */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E3192]/5 border border-[#2E3192]/15 text-[11px] font-semibold text-[#2E3192] dark:text-indigo-300">
              <Shield size={13} className="text-[#2E3192] dark:text-indigo-400" />
              <span>All marketplace listings are reviewed by our team</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3.5">
              Explore Categories
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "All Marketplace Items" },
                { href: "/?category=Computer+Science", label: "Computer Science" },
                { href: "/?category=Engineering", label: "Engineering" },
                { href: "/?category=Medicine", label: "Medicine & Health" },
                { href: "/?category=Business", label: "Business & Economics" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-gray-500 hover:text-[#2E3192] dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Account Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3.5">
              Platform & Legal
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/login", label: "Student Sign In" },
                { href: "/register", label: "Create Account" },
                { href: "/dashboard/listings/new", label: "Sell Study Materials" },
                { href: "#", label: "Privacy Policy & Terms" },
              ].map((l, idx) => (
                <li key={idx}>
                  <Link
                    href={l.href}
                    className="text-xs text-gray-500 hover:text-[#2E3192] dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="border-t border-[#E5E5E0] dark:border-[#26282E] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} Campusly Academic Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-600 transition-colors">Built for Universities</span>
            <span>•</span>
            <span className="hover:text-gray-600 transition-colors">Moderated & Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
