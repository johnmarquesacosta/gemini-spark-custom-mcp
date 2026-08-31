import React from "react";
import { PostEditor } from "@/components/posts/PostEditor";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let post;
  let categories = [];

  try {
    post = await api.get(`/posts/${id}`);
    categories = await api.get("/categories");
  } catch {
    notFound();
  }

  return (
    <div>
      <Link 
        href="/dashboard/posts" 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Articles
      </Link>
      <PostEditor post={post} categories={categories} />
    </div>
  );
}
