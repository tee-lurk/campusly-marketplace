"use client";

import React from "react";
import { motion } from "framer-motion";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#E5E5E0] dark:border-[#26282E] rounded-2xl overflow-hidden shadow-2xs h-full flex flex-col">
      {/* 16:9 Thumbnail Skeleton */}
      <div className="relative aspect-[16/9] bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
        />
      </div>

      {/* Body Skeleton */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* Category Tag */}
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
            />
          </div>

          {/* Title Lines */}
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
            />
          </div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
            />
          </div>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E0] dark:border-[#26282E] mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
              />
            </div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-md relative overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
              />
            </div>
          </div>

          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
