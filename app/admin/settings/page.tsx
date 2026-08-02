"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  FolderTree, 
  Tag, 
  Sliders, 
  Shield, 
  User, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  ShieldAlert, 
  Layers, 
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Upload,
  Zap,
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { FadeArc } from "@/components/loading-ui/fade-arc";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface ProductType {
  id: string;
  name: string;
  category_id: string;
  _count?: { products: number };
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
  productTypes?: ProductType[];
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"categories" | "controls" | "account" | "notifications">("categories");

  // State: Categories & Sub-Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [expandedCatIds, setExpandedCatIds] = useState<string[]>([]);

  // Sub-Category State
  const [newSubCatName, setNewSubCatName] = useState<Record<string, string>>({});
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState("");

  // State: Platform Controls
  const [platformConfig, setPlatformConfig] = useState({
    autoApproveAllListings: true,
    slaHours: "24",
    maintenanceMode: false,
  });

  // State: Admin Account & Avatar Update
  const [adminName, setAdminName] = useState(user?.name || "");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(user?.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State: Feedback
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = () => localStorage.getItem("campusly_access_token") ?? "";

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("campusly_platform_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setPlatformConfig({
          autoApproveAllListings: parsed.autoApproveAllListings ?? true,
          slaHours: parsed.slaHours ?? "24",
          maintenanceMode: parsed.maintenanceMode ?? false,
        });
      } catch (e) {
        console.error("Error reading saved config", e);
      }
    } else {
      // Default autoApproveAllListings to true
      localStorage.setItem("campusly_platform_config", JSON.stringify(platformConfig));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setAdminName(user.name || "");
      setAdminAvatarUrl(user.avatar || "");
    }
  }, [user]);

  // Fetch Categories and their Product Types from DB
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data: Category[] = await res.json();
        setCategories(data);
        // Expand first category by default if none expanded
        if (data.length > 0 && expandedCatIds.length === 0) {
          setExpandedCatIds([data[0].id]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Main Category Actions (Create, Update, Delete)
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Category "${newCatName}" created successfully!`);
        setNewCatName("");
        if (data.id) setExpandedCatIds((prev) => [...prev, data.id]);
        fetchCategories();
      } else {
        setActionError(data.message || "Failed to create category.");
      }
    } catch (err) {
      setActionError("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: editingCatName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Category name updated!");
        setEditingCatId(null);
        setEditingCatName("");
        fetchCategories();
      } else {
        setActionError(data.message || "Failed to update category.");
      }
    } catch (err) {
      setActionError("Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" and all its sub-categories?`)) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Category "${name}" deleted!`);
        fetchCategories();
      } else {
        setActionError(data.message || "Cannot delete category.");
      }
    } catch (err) {
      setActionError("Failed to delete category.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Sub-Category Actions (Create, Update, Delete under a Category)
  const handleAddSubCategory = async (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    const name = newSubCatName[catId]?.trim();
    if (!name) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name, category_id: catId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Sub-category "${name}" added!`);
        setNewSubCatName((prev) => ({ ...prev, [catId]: "" }));
        fetchCategories();
      } else {
        setActionError(data.message || "Failed to add sub-category.");
      }
    } catch (err) {
      setActionError("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubCategory = async (subId: string) => {
    if (!editingSubName.trim()) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types/${subId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: editingSubName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Sub-category updated!");
        setEditingSubId(null);
        setEditingSubName("");
        fetchCategories();
      } else {
        setActionError(data.message || "Failed to update sub-category.");
      }
    } catch (err) {
      setActionError("Failed to update sub-category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (subId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove sub-category "${name}"?`)) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types/${subId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Sub-category "${name}" removed!`);
        fetchCategories();
      } else {
        setActionError(data.message || "Cannot delete sub-category.");
      }
    } catch (err) {
      setActionError("Failed to delete sub-category.");
    } finally {
      setSubmitting(false);
    }
  };

  // Platform Controls Save
  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("campusly_platform_config", JSON.stringify(platformConfig));
    setActionSuccess("Platform moderation policy updated! User listing auto-approval is now " + (platformConfig.autoApproveAllListings ? "ACTIVE" : "INACTIVE") + ".");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  // Admin Profile & Avatar Update
  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    setActionError("");
    setActionSuccess("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAdminAvatarUrl(data.url);
        // Save to profile
        await updateAdminProfile(adminName, data.url);
      } else {
        setActionError(data.message || "Failed to upload avatar image.");
      }
    } catch (e) {
      setActionError("Error uploading avatar image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateAdminProfile = async (name: string, avatarUrl: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name, avatar_url: avatarUrl }),
      });
      if (res.ok) {
        setActionSuccess("Admin profile & PFP updated successfully!");
      } else {
        const err = await res.json();
        setActionError(err.message || "Failed to update profile.");
      }
    } catch (e) {
      setActionError("Error connecting to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile(adminName, adminAvatarUrl);
  };

  // Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setActionError("New password and confirmation do not match.");
      return;
    }
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ old_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Admin password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setActionError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setActionError("Error connecting to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
              System & Platform Settings
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage marketplace categories, sub-categories, listing moderation policies, and administrator credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Action Feedback Banners */}
      {actionSuccess && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-4 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError("")} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Settings Navigation & Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-xs space-y-1 h-fit">
          {[
            { id: "categories", label: "Categories & Sub-Types", icon: FolderTree, desc: "Manage taxonomy & sub-categories" },
            { id: "controls", label: "Moderation Rules", icon: Sliders, desc: "Auto-approval & SLA rules" },
            { id: "account", label: "Admin Security & PFP", icon: Shield, desc: "Avatar, Profile & Password" },
            { id: "notifications", label: "System Alerts", icon: Bell, desc: "Admin notification triggers" },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setActionSuccess("");
                  setActionError("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                  active
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{item.label}</div>
                  <div className={cn("text-[10px] truncate mt-0.5", active ? "text-indigo-100" : "text-gray-400")}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings Tab Content Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs min-h-[500px]">
          
          {/* TAB 1: CATEGORIES & SUB-CATEGORIES MERGED TREE */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FolderTree size={20} className="text-indigo-600" />
                    Marketplace Categories & Sub-Categories
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click a category to view, add, or remove its sub-categories directly inline.
                  </p>
                </div>

                <button
                  onClick={fetchCategories}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                  title="Refresh Categories"
                >
                  <RefreshCw size={16} className={cn(catLoading && "animate-spin text-indigo-600")} />
                </button>
              </div>

              {/* Add New Main Category Form */}
              <form onSubmit={handleCreateCategory} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter new main category (e.g. Textbooks, Tech & Devices)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={submitting || !newCatName.trim()}
                  className="w-full md:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm rounded-xl transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {submitting ? <FadeArc className="w-4 h-4 text-white" /> : <Plus size={16} />}
                  <span>Add Category</span>
                </button>
              </form>

              {/* Category Tree List */}
              {catLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner size="lg" className="text-indigo-600" />
                </div>
              ) : categories.length === 0 ? (
                <EmptyState
                  icon={<FolderTree size={40} />}
                  title="No categories created"
                  description="Create your first category above to structure your marketplace."
                />
              ) : (
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const isExpanded = expandedCatIds.includes(cat.id);
                    const subList = cat.productTypes || [];

                    return (
                      <div
                        key={cat.id}
                        className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
                      >
                        {/* Category Header Bar */}
                        <div
                          className="p-4 bg-gray-50/70 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-100/60 transition-colors"
                          onClick={() => toggleCategoryExpand(cat.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-1 rounded-md text-gray-400 hover:text-gray-700">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>

                            {editingCatId === cat.id ? (
                              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingCatName}
                                  onChange={(e) => setEditingCatName(e.target.value)}
                                  className="flex-1 px-3 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  disabled={submitting}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingCatId(null)}
                                  className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 flex-shrink-0">
                                  {cat.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-bold text-gray-900 truncate">{cat.name}</h3>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {cat._count?.products ?? 0} active product(s) • {subList.length} sub-category(ies)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Category Actions */}
                          {editingCatId !== cat.id && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatName(cat.name);
                                }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Rename Category"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Expanded Sub-Categories Section */}
                        {isExpanded && (
                          <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={13} className="text-indigo-600" />
                                Sub-Categories under "{cat.name}"
                              </h4>
                              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {subList.length} Total
                              </span>
                            </div>

                            {/* Add Sub-Category Form under this specific Category */}
                            <form
                              onSubmit={(e) => handleAddSubCategory(cat.id, e)}
                              className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200/80"
                            >
                              <input
                                type="text"
                                placeholder={`Add new sub-category to ${cat.name}...`}
                                value={newSubCatName[cat.id] || ""}
                                onChange={(e) => setNewSubCatName({ ...newSubCatName, [cat.id]: e.target.value })}
                                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                              <button
                                type="submit"
                                disabled={submitting || !newSubCatName[cat.id]?.trim()}
                                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all flex items-center gap-1 flex-shrink-0"
                              >
                                <Plus size={14} />
                                <span>Add Sub-Category</span>
                              </button>
                            </form>

                            {/* Sub-Categories Chips / List */}
                            {subList.length === 0 ? (
                              <div className="p-4 text-center bg-gray-50/50 rounded-xl text-xs text-gray-400 italic">
                                No sub-categories added to "{cat.name}" yet. Add one above.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {subList.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-2 hover:bg-indigo-50/30 transition-colors"
                                  >
                                    {editingSubId === sub.id ? (
                                      <div className="flex items-center gap-1.5 flex-1">
                                        <input
                                          type="text"
                                          value={editingSubName}
                                          onChange={(e) => setEditingSubName(e.target.value)}
                                          className="flex-1 px-2 py-1 text-xs bg-white border border-indigo-300 rounded focus:outline-none"
                                        />
                                        <button
                                          onClick={() => handleUpdateSubCategory(sub.id)}
                                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                        >
                                          <Check size={13} />
                                        </button>
                                        <button
                                          onClick={() => setEditingSubId(null)}
                                          className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Tag size={13} className="text-indigo-500 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                          {sub.name}
                                        </span>
                                        {sub._count?.products !== undefined && (
                                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                                            {sub._count.products}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {editingSubId !== sub.id && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingSubId(sub.id);
                                            setEditingSubName(sub.name);
                                          }}
                                          className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                          title="Rename"
                                        >
                                          <Edit2 size={13} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                                          title="Remove Sub-Category"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODERATION RULES */}
          {activeTab === "controls" && (
            <form onSubmit={handleSavePlatformConfig} className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders size={20} className="text-indigo-600" />
                  Moderation Rules & System Policies
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure user listing auto-approval behavior and SLA review time limits.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Auto-Approve All User Listings */}
                <div className="p-5 border border-indigo-100 bg-indigo-50/40 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      <Zap size={16} className="text-indigo-600" />
                      Auto-Approve All User Listings
                    </h3>
                    <p className="text-[11px] text-gray-600 leading-relaxed max-w-xl">
                      When turned <strong>ON</strong>, every listing created or updated by any user is published <strong>immediately</strong> to the marketplace without waiting for manual admin approval. Users will see an instant publishing banner.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={platformConfig.autoApproveAllListings}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, autoApproveAllListings: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Status Notice Preview */}
                <div className="p-4 border border-emerald-200 bg-emerald-50/60 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <Info size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>
                    {platformConfig.autoApproveAllListings ? (
                      <><strong>Active Notice for Users:</strong> Users creating a listing will see: <em>"⚡ Instant Publishing Active: Your listing will go live immediately!"</em></>
                    ) : (
                      <><strong>Manual Moderation Active:</strong> User listings will require admin review before going live.</>
                    )}
                  </span>
                </div>

                {/* SLA Hours Selection */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Review SLA Target Window</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Target turnaround time for reviewing pending seller submissions.
                    </p>
                  </div>
                  <select
                    value={platformConfig.slaHours}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, slaHours: e.target.value })}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours (Recommended)</option>
                    <option value="48">48 Hours</option>
                  </select>
                </div>

                {/* Maintenance Mode */}
                <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert size={16} className="text-amber-600" />
                      Platform Maintenance Mode
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Display a maintenance banner across the marketplace and restrict new listing creation during upgrades.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={platformConfig.maintenanceMode}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 rounded-xl transition-all flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Save Moderation Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADMIN SECURITY & PFP */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-600" />
                  Admin Account & Profile Picture (PFP)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Change your profile photo, update display details, or change your account password.
                </p>
              </div>

              {/* Admin Profile Picture & Profile Form */}
              <form onSubmit={handleSaveAdminProfile} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Admin Profile Picture & Display Name
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Upload Container */}
                  <div className="relative group flex-shrink-0">
                    <img
                      src={adminAvatarUrl || user?.avatar || "/default-avatar.svg"}
                      alt="Admin Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-gray-200"
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <FadeArc className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => avatarFileRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-transform active:scale-95"
                      title="Change PFP"
                    >
                      <Upload size={14} />
                    </button>
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Avatar Image URL (or upload above)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={adminAvatarUrl}
                        onChange={(e) => setAdminAvatarUrl(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || uploadingAvatar}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    {submitting ? <FadeArc className="w-4 h-4 text-white" /> : <Save size={14} />}
                    <span>Save Profile & PFP</span>
                  </button>
                </div>
              </form>

              {/* Password Change Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Change Admin Password
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/20 rounded-xl transition-all flex items-center gap-2"
                  >
                    {submitting ? <FadeArc className="w-4 h-4 text-white" /> : <Lock size={16} />}
                    <span>Update Admin Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SYSTEM NOTIFICATION ALERTS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bell size={20} className="text-indigo-600" />
                  Admin Notification Channels
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose which platform activity triggers instant notifications to your admin dashboard and email.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { title: "New Seller Verification Submissions", desc: "Notify when a student uploads an ID for blue tick verification." },
                  { title: "Pending Listing Queue Alerts", desc: "Notify when a seller submits a product awaiting review." },
                  { title: "Flagged Content & Reports", desc: "Alert when a user reports a listing for policy violations." },
                  { title: "Completed Platform Purchases", desc: "Receive real-time notifications for marketplace transactions." },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{item.title}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActionSuccess("Notification preferences updated!");
                    setTimeout(() => setActionSuccess(""), 4000);
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 rounded-xl transition-all flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
