"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ChevronLeft, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

interface ProductType {
  id: string;
  name: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  productTypes: ProductType[];
}

interface ListingFormProps {
  mode: "new" | "edit";
  productId?: string;
  initial?: {
    title?: string;
    description?: string;
    price?: number;
    category_id?: string;
    product_type_id?: string;
    images?: string[];
    deliverable_file_url?: string;
  };
}

/** Represents one image slot — tracks upload state independently */
interface ImageSlot {
  /** Local blob URL for immediate preview */
  preview: string;
  /** Real Cloudinary URL — set after successful upload */
  url: string | null;
  uploading: boolean;
  error: string | null;
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  module: "Modules",
  notes: "Lecture Notes",
  "past-exam": "Past Exam Papers",
  "video-lecture": "Video Lectures",
};

const API = API_BASE_URL;

export default function ListingForm({ mode, productId, initial }: ListingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [productTypeId, setProductTypeId] = useState(initial?.product_type_id ?? "");

  /** Slot-based image state — each file has independent upload tracking */
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [deliverableUrl, setDeliverableUrl] = useState(initial?.deliverable_file_url ?? "");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const deliverableInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Load existing images if editing an existing product
  useEffect(() => {
    if (initial?.images) {
      const initialSlots: ImageSlot[] = initial.images.map((url) => ({
        preview: url,
        url: url,
        uploading: false,
        error: null,
      }));
      setSlots(initialSlots);
    }
    if (initial?.deliverable_file_url) {
      setDeliverableUrl(initial.deliverable_file_url);
    }
  }, [initial]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const productTypeOptions = selectedCategory
    ? [
        { value: "", label: "Select product type" },
        ...selectedCategory.productTypes.map((pt) => ({
          value: pt.id,
          label: PRODUCT_TYPE_LABELS[pt.name] ?? pt.name,
        })),
      ]
    : [{ value: "", label: "Select a category first" }];

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Enter a valid price.";
    if (!categoryId) e.category = "Select a category.";
    if (!productTypeId) e.productType = "Select a product type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Upload a single file to the backend /uploads/image endpoint */
  const uploadFile = async (file: File, slotIndex: number) => {
    const token = localStorage.getItem("campusly_access_token") ?? "";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Upload failed. Please try again.";
        setSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex ? { ...s, uploading: false, error: msg } : s
          )
        );
        return;
      }

      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex
            ? { ...s, uploading: false, url: data.url, error: null }
            : s
        )
      );
    } catch (err: any) {
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex
            ? {
                ...s,
                uploading: false,
                error: "Network error — check your connection and retry.",
              }
            : s
        )
      );
    }
  };

  /** Called when files are selected (click or drag-and-drop) */
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);

      // Add the slot first so we know its index
      setSlots((prev) => {
        const newSlot: ImageSlot = {
          preview,
          url: null,
          uploading: true,
          error: null,
        };
        const nextIndex = prev.length;
        // Kick off the upload after state settles
        setTimeout(() => uploadFile(file, nextIndex), 0);
        return [...prev, newSlot];
      });
    });
  };

  const removeSlot = (i: number) => {
    setSlots((prev) => {
      const slot = prev[i];
      // Revoke blob URL to free memory
      if (slot?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(slot.preview);
      }
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const anyUploading = slots.some((s) => s.uploading);
  const anyErrors = slots.some((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("campusly_access_token");
    if (!token) {
      setErrors({ submit: "You must be logged in to create a listing." });
      return;
    }

    // Block submit if any upload is still in-flight
    if (anyUploading) {
      setErrors({ submit: "Please wait for all images to finish uploading." });
      return;
    }

    setSubmitting(true);

    try {
      const url =
        mode === "new"
          ? `${API}/products`
          : `${API}/products/${productId}`;

      const method = mode === "new" ? "POST" : "PATCH";

      const body: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        deliverable_file_url: deliverableUrl || null,
      };

      // Collect successfully uploaded Cloudinary URLs
      const uploadedUrls = slots
        .filter((s) => s.url !== null)
        .map((s) => s.url as string);
      
      body.images = uploadedUrls;

      if (mode === "new") {
        body.category_id = categoryId;
        body.product_type_id = productTypeId;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(", ")
          : errData.message || "Failed to save listing.";
        throw new Error(msg);
      }

      router.push("/dashboard/listings");
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to save listing." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/listings")}
          className="p-2 rounded-md text-text-muted hover:text-text-body hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
            {mode === "new" ? "Add New Listing" : "Edit Listing"}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {mode === "new"
              ? "Fill in the details below to list your materials."
              : "Update your listing details below."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main fields */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5 flex flex-col gap-5">
              <Input
                id="listing-title"
                label="Title"
                placeholder="e.g. Complete CS301 Data Structures Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
              />
              <Textarea
                id="listing-description"
                label="Description"
                placeholder="Describe your materials in detail — what topics are covered, what weeks/modules, any bonus content…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                rows={8}
              />
              <Input
                id="listing-price"
                label="Price (ETB)"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
                inputPrefix="ETB"
                min="1"
                step="0.01"
              />
            </div>

            {/* Image Upload */}
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5">
              <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-3">
                Images{" "}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border-soft dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                role="button"
                aria-label="Upload images"
              >
                <Upload size={24} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">
                  Drag &amp; drop images here, or{" "}
                  <span className="text-brand-indigo font-medium">browse files</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  PNG, JPG, WEBP · up to 5 MB each
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  // Reset so the same file can be re-selected after removal
                  e.target.value = "";
                }}
              />

              {/* Image slots */}
              {slots.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {slots.map((slot, i) => (
                    <div key={i} className="relative group">
                      {/* Thumbnail */}
                      <img
                        src={slot.preview}
                        alt={`Preview ${i + 1}`}
                        className={`w-20 h-16 rounded-lg object-cover border transition-opacity ${
                          slot.error
                            ? "border-red-400 opacity-60"
                            : "border-border-soft dark:border-border-dark"
                        }`}
                      />

                      {/* Uploading overlay */}
                      {slot.uploading && (
                        <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                          <Spinner size="sm" />
                        </div>
                      )}

                      {/* Error overlay */}
                      {slot.error && (
                        <div
                          className="absolute inset-0 rounded-lg bg-red-900/60 flex items-center justify-center"
                          title={slot.error}
                        >
                          <AlertCircle size={16} className="text-white" />
                        </div>
                      )}

                      {/* Remove button — always visible on error, hover otherwise */}
                      {!slot.uploading && (
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className={`absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity ${
                            slot.error
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          aria-label="Remove image"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Per-slot error messages */}
              {anyErrors && (
                <div className="mt-3 flex flex-col gap-1">
                  {slots
                    .filter((s) => s.error)
                    .map((s, i) => (
                      <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {s.error}
                      </p>
                    ))}
                </div>
              )}
            </div>

            {/* Deliverable File Upload */}
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5">
              <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-3">
                Deliverable File{" "}
                <span className="text-text-muted font-normal">(PDF, ZIP, EPUB, etc. — visible only to buyers after purchase)</span>
              </label>
              {deliverableUrl ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border-soft dark:border-border-dark">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs bg-brand-indigo/10 text-brand-indigo px-2 py-1 rounded">URL</span>
                    <span className="text-sm text-text-body dark:text-gray-300 truncate max-w-md">{deliverableUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeliverableUrl("")}
                    className="text-text-muted hover:text-red-500 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border-soft dark:border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all"
                  onClick={() => deliverableInputRef.current?.click()}
                >
                  {uploadingFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size="md" />
                      <p className="text-sm text-text-muted">Uploading deliverable file...</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-text-muted mx-auto mb-2" />
                      <p className="text-sm text-text-muted">
                        Click to upload deliverable file (up to 10 MB)
                      </p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={deliverableInputRef}
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingFile(true);
                  setFileError(null);
                  const token = localStorage.getItem("campusly_access_token") ?? "";
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch(`${API}/uploads/file`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) {
                      setDeliverableUrl(data.url);
                    } else {
                      setFileError(data.message || "Failed to upload file.");
                    }
                  } catch {
                    setFileError("Network error uploading file.");
                  } finally {
                    setUploadingFile(false);
                  }
                }}
              />
              {fileError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {fileError}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5 flex flex-col gap-4">
              {loadingCategories ? (
                <p className="text-sm text-text-muted">Loading categories…</p>
              ) : (
                <>
                  <Select
                    id="listing-category"
                    label="Category"
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setProductTypeId("");
                    }}
                    options={categoryOptions}
                    error={errors.category}
                  />
                  <Select
                    id="listing-type"
                    label="Product Type"
                    value={productTypeId}
                    onChange={(e) => setProductTypeId(e.target.value)}
                    options={productTypeOptions}
                    error={errors.productType}
                    disabled={!categoryId}
                  />
                </>
              )}
            </div>

            {/* Moderation notice */}
            <div className="flex items-start gap-3 bg-brand-indigo/5 dark:bg-brand-indigo/10 border border-brand-indigo/20 rounded-xl p-4 text-xs text-text-body dark:text-gray-300 leading-relaxed">
              <Info size={14} className="text-brand-indigo flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-brand-indigo">New listings enter a pending review state</strong>{" "}
                and won&apos;t be publicly visible until approved by our team. This usually takes up to 24 hours.
              </span>
            </div>

            {/* Upload-in-progress notice */}
            {anyUploading && (
              <div className="flex items-center gap-2 text-xs text-brand-indigo bg-brand-indigo/5 border border-brand-indigo/20 rounded-xl px-4 py-3">
                <Spinner size="sm" />
                <span>Uploading images… please wait before submitting.</span>
              </div>
            )}

            {/* Server error */}
            {errors.submit && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={anyUploading}
              >
                {submitting
                  ? "Submitting…"
                  : mode === "new"
                  ? "Publish Listing"
                  : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => router.push("/dashboard/listings")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
