import React from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, Tags, LogOut } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-paper text-ink overflow-hidden">
      {/* Sidebar - Graphite Theme */}
      <aside className="w-64 bg-graphite text-gray-300 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="p-6">
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
              Antigravity
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">
              Publishing Control
            </p>
          </div>

          <nav className="mt-6 flex flex-col px-4 gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-gray-800 transition-colors"
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium">Overview</span>
            </Link>
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-gray-800 transition-colors"
            >
              <FileText size={18} />
              <span className="text-sm font-medium">Articles</span>
            </Link>
            <Link
              href="/dashboard/categories"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Tags size={18} />
              <span className="text-sm font-medium">Categories</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded hover:bg-gray-800 transition-colors text-sm font-medium text-gray-400 hover:text-white">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
