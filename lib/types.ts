// TypeScript interfaces for CAMPUSLY

export type UserRole = "student" | "admin";
export type ProductType = "module" | "notes" | "past-exam" | "video-lecture";
export type Category =
  | "Engineering"
  | "Business"
  | "Medicine"
  | "Law"
  | "Computer Science"
  | "Mathematics"
  | "Arts & Humanities"
  | "Natural Sciences";
export type ListingStatus = "pending" | "approved" | "rejected" | "sold";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  memberSince: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  productType: ProductType;
  images: string[];
  seller: User;
  status: ListingStatus;
  createdAt: string;
  rejectionReason?: string;
  isFeatured?: boolean;
  reportCount?: number;
}

export interface FilterState {
  category: Category | "";
  productType: ProductType | "";
  sort: "newest" | "price-asc" | "price-desc";
  search: string;
}

export interface AdminStats {
  totalListings: number;
  activeUsers: number;
  pendingReview: number;
  flaggedReported: number;
}

export interface Order {
  id: string;
  product: Product;
  buyer: User;
  createdAt: string;
  status: "completed" | "failed" | "refunded";
}
