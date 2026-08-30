import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PostList } from "../../../components/posts/PostList";

export default function PostsPage() {
  return (
    <div>
      <PageHeader
        title="Articles"
        description="All Published and Draft Posts"
        action={
          <Link
            href="/dashboard/posts/new"
            className="flex items-center gap-2 bg-crimson text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-rose-700 transition-colors"
          >
            <Plus size={18} />
            Write Article
          </Link>
        }
      />

      <div className="mt-8">
        <PostList />
      </div>
    </div>
  );
}
