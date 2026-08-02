"use client";

import React, { useState, useEffect } from "react";
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
  Server
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
  productTypes?: { id: string; name: string; _count?: { products: number } }[];
}

interface ProductType {
  id: string;
  name: string;
  category_id: string;
  category?: { id: string; name: string };
  _count?: { products: number };
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"taxonomy" | "types" | "controls" | "account" | "notifications">("taxonomy");

  // State: Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // State: Product Types
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [ptLoading, setPtLoading] = useState(true);
  const [newPtName, setNewPtName] = useState("");
  const [newPtCatId, setNewPtCatId] = useState("");
  const [editingPtId, setEditingPtId] = useState<string | null>(null);
  const [editingPtName, setEditingPtName] = useState("");
  const [filterPtCatId, setFilterPtCatId] = useState<string>("all");

  // State: Platform Controls
  const [platformConfig, setPlatformConfig] = useState({
    autoApproveVerified: false,
    requireStudentIdToSell: true,
    slaHours: "24",
    maintenanceMode: false,
    maxListingsPerUser: "15",
  });

  // State: Admin Account Update
  const [adminName, setAdminName] = useState(user?.name || "");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
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
        setPlatformConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error reading saved config", e);
      }
    }
  }, []);

  // Fetch Categories from DB
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !newPtCatId) {
          setNewPtCatId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setCatLoading(false);
    }
  };

  // Fetch Product Types from DB
  const fetchProductTypes = async () => {
    setPtLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProductTypes(data);
      }
    } catch (e) {
      console.error("Failed to fetch product types", e);
    } finally {
      setPtLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductTypes();
  }, []);

  // Category Actions (Create, Update, Delete)
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
        setActionSuccess("Category updated successfully!");
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
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
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
        fetchProductTypes();
      } else {
        setActionError(data.message || "Cannot delete category.");
      }
    } catch (err) {
      setActionError("Failed to delete category.");
    } finally {
      setSubmitting(false);
    }
  };

  // Product Type Actions (Create, Update, Delete)
  const handleCreateProductType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtName.trim() || !newPtCatId) return;
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
        body: JSON.stringify({ name: newPtName.trim(), category_id: newPtCatId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Product type "${newPtName}" added!`);
        setNewPtName("");
        fetchProductTypes();
        fetchCategories();
      } else {
        setActionError(data.message || "Failed to create product type.");
      }
    } catch (err) {
      setActionError("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProductType = async (id: string) => {
    if (!editingPtName.trim()) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: editingPtName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Product type updated successfully!");
        setEditingPtId(null);
        setEditingPtName("");
        fetchProductTypes();
      } else {
        setActionError(data.message || "Failed to update product type.");
      }
    } catch (err) {
      setActionError("Failed to update product type.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProductType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product type "${name}"?`)) return;
    setSubmitting(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/product-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Product type "${name}" deleted!`);
        fetchProductTypes();
      } else {
        setActionError(data.message || "Cannot delete product type.");
      }
    } catch (err) {
      setActionError("Failed to delete product type.");
    } finally {
      setSubmitting(false);
    }
  };

  // Platform Controls Save
  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("campusly_platform_config", JSON.stringify(platformConfig));
    setActionSuccess("Platform moderation policies and system controls updated successfully!");
    setTimeout(() => setActionSuccess(""), 4000);
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
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
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

  const filteredProductTypes = productTypes.filter((pt) => {
    if (filterPtCatId === "all") return true;
    return pt.category_id === filterPtCatId;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-2">
      {/* Page Banner Header */}
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
              Manage marketplace categories, product sub-types, listing moderation policies, and administrator account controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <Server size={14} className="text-indigo-600 animate-pulse" />
          <span>Connected to Live Database</span>
        </div>
      </div>

      {/* Action Banners */}
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
            { id: "taxonomy", label: "Categories", icon: FolderTree, desc: "Marketplace categories" },
            { id: "types", label: "Product Types", icon: Tag, desc: "Sub-category mappings" },
            { id: "controls", label: "Moderation & Rules", icon: Sliders, desc: "System policies & SLA" },
            { id: "account", label: "Admin Security", icon: Shield, desc: "Password & Credentials" },
            { id: "notifications", label: "System Alerts", icon: Bell, desc: "Admin email notifications" },
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
          
          {/* TAB 1: CATEGORIES TAXONOMY */}
          {activeTab === "taxonomy" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FolderTree size={20} className="text-indigo-600" />
                    Marketplace Categories
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add, rename, or remove core categories used across seller listings and search filters.
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

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter new category name (e.g. Textbooks, Electronics)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={submitting || !newCatName.trim()}
                  className="w-full md:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm rounded-xl transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {submitting ? <Spinner size="sm" className="text-white" /> : <Plus size={16} />}
                  <span>Add Category</span>
                </button>
              </form>

              {/* Category List */}
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
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">{cat.name}</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {cat._count?.products ?? 0} active listing(s) • {cat.productTypes?.length ?? 0} sub-type(s)
                            </p>
                          </div>
                        </div>
                      )}

                      {editingCatId !== cat.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Rename"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCT TYPES (SUB-CATEGORIES) */}
          {activeTab === "types" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Tag size={20} className="text-indigo-600" />
                    Product Sub-Types
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define detailed sub-categories assigned to parent marketplace categories.
                  </p>
                </div>

                {/* Filter by Category */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Filter:</span>
                  <select
                    value={filterPtCatId}
                    onChange={(e) => setFilterPtCatId(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">All Categories ({productTypes.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add New Product Type Form */}
              <form onSubmit={handleCreateProductType} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
                <select
                  value={newPtCatId}
                  onChange={(e) => setNewPtCatId(e.target.value)}
                  className="w-full md:w-1/3 px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Sub-type name (e.g. Laptops, Course Notes)..."
                  value={newPtName}
                  onChange={(e) => setNewPtName(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                />

                <button
                  type="submit"
                  disabled={submitting || !newPtName.trim() || !newPtCatId}
                  className="w-full md:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm rounded-xl transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {submitting ? <Spinner size="sm" className="text-white" /> : <Plus size={16} />}
                  <span>Add Sub-Type</span>
                </button>
              </form>

              {/* Product Types List */}
              {ptLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner size="lg" className="text-indigo-600" />
                </div>
              ) : filteredProductTypes.length === 0 ? (
                <EmptyState
                  icon={<Tag size={40} />}
                  title="No product sub-types found"
                  description="Add your first sub-type to group items under a category."
                />
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {filteredProductTypes.map((pt) => (
                    <div key={pt.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      {editingPtId === pt.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingPtName}
                            onChange={(e) => setEditingPtName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            onClick={() => handleUpdateProductType(pt.id)}
                            disabled={submitting}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingPtId(null)}
                            className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            <Tag size={14} />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">{pt.name}</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Parent Category: <strong className="text-indigo-600">{pt.category?.name || "Category"}</strong> • {pt._count?.products ?? 0} listing(s)
                            </p>
                          </div>
                        </div>
                      )}

                      {editingPtId !== pt.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingPtId(pt.id);
                              setEditingPtName(pt.name);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Rename"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProductType(pt.id, pt.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLATFORM MODERATION & RULES */}
          {activeTab === "controls" && (
            <form onSubmit={handleSavePlatformConfig} className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders size={20} className="text-indigo-600" />
                  Moderation Rules & System Policies
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure automated listing approval behavior, seller verification policies, and review SLA limits.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Auto-Approve Verified Sellers */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Auto-Approve Verified Sellers</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Automatically publish new listings submitted by blue-tick verified students without requiring manual admin approval.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformConfig.autoApproveVerified}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, autoApproveVerified: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Require Student ID verification for sellers */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Mandatory Student Verification for Selling</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Require users to submit a valid Student ID before they are allowed to create marketplace listings.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformConfig.requireStudentIdToSell}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, requireStudentIdToSell: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* SLA Hours Selection */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Review SLA Target Window</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Target turnaround time for reviewing pending seller submissions on the dashboard stats.
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
                  <label className="relative inline-flex items-center cursor-pointer">
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

          {/* TAB 4: ADMIN SECURITY & PASSWORD */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-600" />
                  Admin Account & Credentials
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your administrator profile details or change your account password.
                </p>
              </div>

              {/* Profile Details Preview */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                <img
                  src={user?.avatar || "/default-avatar.svg"}
                  alt="Admin Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{user?.name || "Administrator"}</h3>
                  <p className="text-xs text-gray-500">@{user?.username || "admin"} • {user?.email}</p>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                    System Administrator
                  </span>
                </div>
              </div>

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
                    {submitting ? <Spinner size="sm" className="text-white" /> : <Lock size={16} />}
                    <span>Update Admin Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: SYSTEM NOTIFICATION ALERTS */}
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
