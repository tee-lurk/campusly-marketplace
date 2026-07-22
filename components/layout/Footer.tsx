import React from "react";
import Link from "next/link";
import { BookOpen, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-soft dark:border-border-dark bg-card dark:bg-card-dark mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand-indigo flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <span className="font-heading font-bold text-brand-indigo text-base">
                Campusly
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              A peer-to-peer marketplace for university students to share and sell
              course materials safely and affordably.
            </p>
            {/* Trust signal */}
            <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
              <Shield size={13} className="text-brand-indigo" />
              <span>All listings are reviewed by our team before going public.</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary dark:text-gray-200 mb-3">
              Marketplace
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/", label: "Browse All" },
                { href: "/?category=Computer+Science", label: "Computer Science" },
                { href: "/?category=Engineering", label: "Engineering" },
                { href: "/?category=Law", label: "Law" },
                { href: "/?category=Business", label: "Business" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-muted hover:text-brand-indigo transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary dark:text-gray-200 mb-3">
              Account
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/login", label: "Log In" },
                { href: "/register", label: "Sign Up" },
                { href: "/dashboard/listings", label: "My Listings" },
                { href: "/dashboard/listings/new", label: "Sell Materials" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-muted hover:text-brand-indigo transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-soft dark:border-border-dark mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Campusly. Students helping students.
          </p>
          <p className="text-xs text-text-muted">
            Built for universities. Moderated for safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
