"use client";

import React, { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  wordpressCategoryId?: number;
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd pass the auth token.
    // For now, we'll try to fetch or use placeholder data if the API isn't reachable
    fetch("http://localhost:3001/categories")
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback for visual design testing
        setCategories([
          { id: "1", name: "Technology", slug: "technology", wordpressCategoryId: 10 },
          { id: "2", name: "Design", slug: "design", wordpressCategoryId: 12 },
          { id: "3", name: "Culture", slug: "culture" },
        ]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-gray-500 font-medium">Loading taxonomy...</div>;
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
            <button className="text-gray-400 hover:text-ink transition-colors" title="Edit">
              <Edit2 size={16} />
            </button>
            <button className="text-gray-400 hover:text-crimson transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
