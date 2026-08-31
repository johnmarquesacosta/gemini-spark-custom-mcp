import React from "react";
import { CategoryEditor } from "@/components/categories/CategoryEditor";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  let category;
  const { id } = await params;

  try {
    category = await api.get(`/categories/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <CategoryEditor category={category} />
    </div>
  );
}
