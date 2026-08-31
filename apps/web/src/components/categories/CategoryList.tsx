import React from "react";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import { api } from "../../lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  wordpressCategoryId?: number;
}

export async function CategoryList() {
  let categories: Category[] = [];

  try {
    categories = await api.get("/categories");
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return (
      <div className="py-12 text-center text-red-500">
        <p className="font-medium">Error loading categories.</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="font-medium">No categories found.</p>
        <p className="text-sm mt-1">Create one to start organizing your posts.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-12 gap-4 pb-3 border-b border-rule text-xs font-semibold uppercase tracking-widest text-gray-500">
        <div className="col-span-4">Name</div>
        <div className="col-span-4">Slug</div>
        <div className="col-span-2">WP ID</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      
      {categories.map((cat) => (
        <div 
          key={cat.id} 
          className="grid grid-cols-12 gap-4 py-4 border-b border-rule items-center hover:bg-gray-50 transition-colors"
        >
          <div className="col-span-4 font-medium text-ink">{cat.name}</div>
          <div className="col-span-4 text-sm font-mono text-gray-600">{cat.slug}</div>
          <div className="col-span-2 text-sm text-gray-500">
            {cat.wordpressCategoryId || "—"}
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            <Link href="#" className="text-gray-400 hover:text-ink transition-colors" title="Edit (Coming Soon)">
              <Edit2 size={16} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-crimson transition-colors" title="Delete (Coming Soon)">
              <Trash2 size={16} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
