import React from "react";
import Link from "next/link";
import { Edit2, ExternalLink } from "lucide-react";
import { api } from "../../lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
}

export async function PostList() {
  let posts: Post[] = [];

  try {
    posts = await api.get("/posts");
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return (
      <div className="py-12 text-center text-red-500">
        <p className="font-medium">Error loading articles.</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="font-medium">No articles yet.</p>
        <p className="text-sm mt-1">Start writing your first piece.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-12 gap-4 pb-3 border-b border-rule text-xs font-semibold uppercase tracking-widest text-gray-500">
        <div className="col-span-6">Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="grid grid-cols-12 gap-4 py-4 border-b border-rule items-center hover:bg-gray-50 transition-colors"
        >
          <div className="col-span-6">
            <div className="font-serif font-medium text-ink text-lg truncate">{post.title}</div>
            <div className="text-xs font-mono text-gray-500 mt-1 truncate">/{post.slug}</div>
          </div>
          <div className="col-span-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
              post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              post.status === 'DRAFT' ? 'bg-gray-200 text-gray-700' :
              'bg-red-100 text-red-800'
            }`}>
              {post.status}
            </span>
          </div>
          <div className="col-span-2 text-sm text-gray-500">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            <Link href="#" className="text-gray-400 hover:text-ink transition-colors" title="Edit (Coming Soon)">
              <Edit2 size={16} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-ink transition-colors" title="View live (Coming Soon)">
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
