"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, publishPost } from "../../app/actions/posts";
import { Save, Send } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  category?: Category;
  status?: string;
  language?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  authorName?: string;
  canonicalUrl?: string;
}

export function PostEditor({ post, categories }: { post?: Post; categories: Category[] }) {
  const router = useRouter();
  const isEditMode = !!post;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");

  // Optional: Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditMode) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        title,
        slug,
        language: formData.get("language") as string,
        excerpt: formData.get("excerpt") as string,
        content: formData.get("content") as string,
        categoryId: formData.get("categoryId") as string,
        schemaType: "BlogPosting", // Default
        metaTitle: formData.get("metaTitle") as string,
        metaDescription: formData.get("metaDescription") as string,
        focusKeyword: formData.get("focusKeyword") as string,
        authorName: formData.get("authorName") as string || undefined,
        canonicalUrl: formData.get("canonicalUrl") as string || undefined,
        status: post?.status || "DRAFT",
      };

      if (isEditMode) {
        await updatePost(post.id, data);
      } else {
        await createPost(data);
      }
      
      router.push("/dashboard/posts");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save post";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!isEditMode) return;
    setLoading(true);
    try {
      await publishPost(post.id);
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to publish post";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PageHeader
        title={isEditMode ? "Edit Article" : "Drafting"}
        action={
          <div className="flex gap-3">
            {isEditMode && post.status === "DRAFT" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
                Publish
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isEditMode ? "Save Changes" : "Save Draft"}
            </button>
          </div>
        }
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <input
            name="title"
            type="text"
            placeholder="Enter a striking headline..."
            value={title}
            onChange={handleTitleChange}
            required
            className="w-full text-4xl font-serif text-ink placeholder:text-gray-300 focus:outline-none bg-transparent"
          />

          <div className="flex items-center gap-2 border-b border-rule pb-6">
            <span className="text-gray-400 text-sm">/posts/</span>
            <input
              name="slug"
              type="text"
              placeholder="Url slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1 text-sm font-mono text-ink placeholder:text-gray-300 focus:outline-none bg-transparent"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="sr-only">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              placeholder="Write a brief excerpt..."
              defaultValue={post?.excerpt}
              required
              rows={3}
              className="w-full text-lg leading-relaxed text-gray-600 placeholder:text-gray-300 focus:outline-none bg-transparent resize-y border-b border-rule pb-6"
            />
          </div>

          <div>
            <label htmlFor="content" className="sr-only">Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="Start writing the story..."
              defaultValue={post?.content}
              required
              className="w-full min-h-[500px] text-lg leading-relaxed text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent resize-y"
            />
          </div>
        </div>

        {/* Sidebar / Settings Area */}
        <div className="col-span-12 lg:col-span-4 space-y-6 bg-gray-50 p-6 rounded border border-rule">
          <h3 className="font-serif font-semibold text-lg text-ink mb-4 border-b border-rule pb-2">Settings & SEO</h3>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={post?.categoryId || post?.category?.id || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm bg-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
            <select
              id="language"
              name="language"
              required
              defaultValue={post?.language || "pt-BR"}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm bg-white"
            >
              <option value="pt-BR">Portuguese (pt-BR)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </div>

          <div>
            <label htmlFor="metaTitle" className="block text-sm font-semibold text-gray-700 mb-1">Meta Title</label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              required
              defaultValue={post?.metaTitle}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink text-sm bg-white"
            />
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              required
              rows={3}
              defaultValue={post?.metaDescription}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink text-sm bg-white resize-y"
            />
          </div>

          <div>
            <label htmlFor="focusKeyword" className="block text-sm font-semibold text-gray-700 mb-1">Focus Keyword</label>
            <input
              id="focusKeyword"
              name="focusKeyword"
              type="text"
              required
              defaultValue={post?.focusKeyword}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink text-sm bg-white"
            />
          </div>
          
          <div>
            <label htmlFor="authorName" className="block text-sm font-semibold text-gray-700 mb-1">Author Name (Optional)</label>
            <input
              id="authorName"
              name="authorName"
              type="text"
              defaultValue={post?.authorName}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink text-sm bg-white"
            />
          </div>
          
          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-semibold text-gray-700 mb-1">Canonical URL (Optional)</label>
            <input
              id="canonicalUrl"
              name="canonicalUrl"
              type="url"
              defaultValue={post?.canonicalUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink text-sm bg-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
