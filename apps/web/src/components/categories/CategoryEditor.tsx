"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "../../app/actions/categories";
import { Save } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  wordpressCategoryId?: number;
}

interface CategoryEditorProps {
  category?: Category;
}

export function CategoryEditor({ category }: CategoryEditorProps) {
  const router = useRouter();
  const isEditMode = !!category;

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [wordpressCategoryId, setWordpressCategoryId] = useState<string>(
    category?.wordpressCategoryId?.toString() || ""
  );
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        name,
        slug,
        wordpressCategoryId: wordpressCategoryId ? parseInt(wordpressCategoryId, 10) : undefined,
      };

      if (isEditMode && category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      
      router.push("/dashboard/categories");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred while saving the category.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-serif font-bold text-ink mb-6">
        {isEditMode ? "Edit Category" : "New Category"}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technology"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. technology"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Used in the URL path. Lowercase letters, numbers, and hyphens only.</p>
        </div>

        <div>
          <label htmlFor="wordpressCategoryId" className="block text-sm font-semibold text-gray-700 mb-1">
            WordPress Category ID
          </label>
          <input
            id="wordpressCategoryId"
            type="number"
            value={wordpressCategoryId}
            onChange={(e) => setWordpressCategoryId(e.target.value)}
            placeholder="Optional mapping"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/categories")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isEditMode ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>
    </form>
  );
}
