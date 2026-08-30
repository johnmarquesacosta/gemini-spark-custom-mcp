"use client";

import React, { useState } from "react";
import { PageHeader } from "../../../../components/layout/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        href="/dashboard/posts" 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Articles
      </Link>

      <PageHeader
        title="Drafting"
        action={
          <button className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded font-medium shadow-sm hover:bg-gray-800 transition-colors">
            <Save size={18} />
            Save Draft
          </button>
        }
      />

      <div className="mt-8">
        <input
          type="text"
          placeholder="Enter a striking headline..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-serif text-ink placeholder:text-gray-300 focus:outline-none bg-transparent mb-8"
        />

        <textarea
          placeholder="Start writing the story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[500px] text-lg leading-relaxed text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent resize-y"
        />
      </div>
    </div>
  );
}
