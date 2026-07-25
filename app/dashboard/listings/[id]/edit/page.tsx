"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ListingForm from "@/components/dashboard/ListingForm";
import { Spinner } from "@/components/ui/Spinner";
import { API_BASE_URL } from "@/lib/api";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("campusly_access_token");
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          
          let deliverable_file_url = "";
          try {
            const dlRes = await fetch(`${API_BASE_URL}/products/${id}/download`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (dlRes.ok) {
              const dlData = await dlRes.json();
              deliverable_file_url = dlData.deliverable_file_url || "";
            }
          } catch (dlErr) {
            console.error("Failed to fetch deliverable url:", dlErr);
          }

          setInitial({
            title: data.title,
            description: data.description,
            price: data.price,
            category_id: data.category_id,
            product_type_id: data.product_type_id,
            images: (data.images ?? []).map((img: any) => img.image_url),
            deliverable_file_url,
          });
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  return <ListingForm mode="edit" productId={id} initial={initial ?? undefined} />;
}
