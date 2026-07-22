"use client";

import React from "react";
import { X, ChevronDown } from "lucide-react";
import { FilterState, Category, ProductType } from "@/lib/types";
import { CATEGORIES, PRODUCT_TYPES, SORT_OPTIONS } from "@/lib/mockData";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearCategory = () => onChange({ ...filters, category: "" });
  const clearType = () => onChange({ ...filters, productType: "" });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Category */}
      <div className="relative">
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm rounded-pill border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-body dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo cursor-pointer transition-colors"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>

      {/* Product Type */}
      <div className="relative">
        <select
          id="filter-type"
          value={filters.productType}
          onChange={(e) => set("productType", e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm rounded-pill border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-body dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo cursor-pointer transition-colors"
        >
          <option value="">All Types</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm rounded-pill border border-border-soft dark:border-border-dark bg-card dark:bg-card-dark text-text-body dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo cursor-pointer transition-colors"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>

      {/* Active filter chips */}
      {filters.category && (
        <ActiveChip label={filters.category} onClear={clearCategory} />
      )}
      {filters.productType && (
        <ActiveChip
          label={PRODUCT_TYPES.find((t) => t.value === filters.productType)?.label ?? filters.productType}
          onClear={clearType}
        />
      )}
    </div>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-indigo text-white text-xs font-medium">
      {label}
      <button
        onClick={onClear}
        className="hover:opacity-80 transition-opacity"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </span>
  );
}
