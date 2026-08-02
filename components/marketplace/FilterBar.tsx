"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "@/lib/types";
import { CATEGORIES, PRODUCT_TYPES, SORT_OPTIONS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const setFilter = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearCategory = () => onChange({ ...filters, category: "" });
  const clearType = () => onChange({ ...filters, productType: "" });

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === filters.sort)?.label || "Newest Arrivals";

  return (
    <div className="flex flex-wrap items-center gap-3 py-1">
      
      {/* Category Custom Dropdown */}
      <div className="relative" ref={catRef}>
        <button
          type="button"
          onClick={() => {
            setCatOpen((v) => !v);
            setTypeOpen(false);
            setSortOpen(false);
          }}
          className={cn(
            "flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#16181D] text-gray-800 dark:text-gray-200 transition-all duration-200 cursor-pointer min-w-[140px]",
            catOpen
              ? "border-[#2E3192] ring-2 ring-[#2E3192]/20 shadow-xs"
              : filters.category
              ? "border-[#2E3192]/60 bg-[#2E3192]/5 text-[#2E3192]"
              : "border-[#E5E5E0] dark:border-[#26282E] hover:border-[#2E3192]/40"
          )}
        >
          <span className="truncate">
            {filters.category ? filters.category : "All Categories"}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400 transition-transform duration-200 flex-shrink-0",
              catOpen && "rotate-180 text-[#2E3192]"
            )}
          />
        </button>

        <AnimatePresence>
          {catOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-[#16181D] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl shadow-lg py-1.5 z-30 max-h-60 overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => {
                  setFilter("category", "");
                  setCatOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors font-medium",
                  !filters.category ? "text-[#2E3192] font-bold bg-[#2E3192]/5" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <span>All Categories</span>
                {!filters.category && <Check size={14} className="text-[#2E3192]" />}
              </button>
              
              {CATEGORIES.map((c) => {
                const selected = filters.category === c;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setFilter("category", c);
                      setCatOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors font-medium",
                      selected ? "text-[#2E3192] font-bold bg-[#2E3192]/5" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="truncate">{c}</span>
                    {selected && <Check size={14} className="text-[#2E3192]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Type Custom Dropdown */}
      <div className="relative" ref={typeRef}>
        <button
          type="button"
          onClick={() => {
            setTypeOpen((v) => !v);
            setCatOpen(false);
            setSortOpen(false);
          }}
          className={cn(
            "flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#16181D] text-gray-800 dark:text-gray-200 transition-all duration-200 cursor-pointer min-w-[130px]",
            typeOpen
              ? "border-[#2E3192] ring-2 ring-[#2E3192]/20 shadow-xs"
              : filters.productType
              ? "border-[#2E3192]/60 bg-[#2E3192]/5 text-[#2E3192]"
              : "border-[#E5E5E0] dark:border-[#26282E] hover:border-[#2E3192]/40"
          )}
        >
          <span className="truncate">
            {filters.productType
              ? PRODUCT_TYPES.find((t) => t.value === filters.productType)?.label || filters.productType
              : "All Material Types"}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400 transition-transform duration-200 flex-shrink-0",
              typeOpen && "rotate-180 text-[#2E3192]"
            )}
          />
        </button>

        <AnimatePresence>
          {typeOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#16181D] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl shadow-lg py-1.5 z-30 overflow-hidden"
            >
              <button
                onClick={() => {
                  setFilter("productType", "");
                  setTypeOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors font-medium",
                  !filters.productType ? "text-[#2E3192] font-bold bg-[#2E3192]/5" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <span>All Types</span>
                {!filters.productType && <Check size={14} className="text-[#2E3192]" />}
              </button>

              {PRODUCT_TYPES.map((t) => {
                const selected = filters.productType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setFilter("productType", t.value);
                      setTypeOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors font-medium",
                      selected ? "text-[#2E3192] font-bold bg-[#2E3192]/5" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span>{t.label}</span>
                    {selected && <Check size={14} className="text-[#2E3192]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Custom Dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          type="button"
          onClick={() => {
            setSortOpen((v) => !v);
            setCatOpen(false);
            setTypeOpen(false);
          }}
          className={cn(
            "flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#16181D] text-gray-800 dark:text-gray-200 transition-all duration-200 cursor-pointer min-w-[140px]",
            sortOpen
              ? "border-[#2E3192] ring-2 ring-[#2E3192]/20 shadow-xs"
              : "border-[#E5E5E0] dark:border-[#26282E] hover:border-[#2E3192]/40"
          )}
        >
          <span className="truncate">{activeSortLabel}</span>
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400 transition-transform duration-200 flex-shrink-0",
              sortOpen && "rotate-180 text-[#2E3192]"
            )}
          />
        </button>

        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#16181D] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl shadow-lg py-1.5 z-30 overflow-hidden"
            >
              {SORT_OPTIONS.map((s) => {
                const selected = filters.sort === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => {
                      setFilter("sort", s.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors font-medium",
                      selected ? "text-[#2E3192] font-bold bg-[#2E3192]/5" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span>{s.label}</span>
                    {selected && <Check size={14} className="text-[#2E3192]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filter Dismissible Chips */}
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
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2E3192]/10 text-[#2E3192] dark:bg-[#2E3192]/20 dark:text-indigo-300 text-xs font-semibold border border-[#2E3192]/20"
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="p-0.5 rounded-full hover:bg-[#2E3192]/20 transition-colors cursor-pointer"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} className="text-[#2E3192] dark:text-indigo-300" />
      </button>
    </motion.span>
  );
}
