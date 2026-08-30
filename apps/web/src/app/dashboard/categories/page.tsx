import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { CategoryList } from "../../../components/categories/CategoryList";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Taxonomy"
        description="Categories & Tags"
        action={
          <Link
            href="/dashboard/categories/new"
            className="flex items-center gap-2 bg-crimson text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-rose-700 transition-colors"
          >
            <Plus size={18} />
            New Category
          </Link>
        }
      />

      <div className="mt-8">
        <CategoryList />
      </div>
    </div>
  );
}
