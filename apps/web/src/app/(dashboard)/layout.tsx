"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api";
import { LogOut, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is loaded, if not, try fetching
    if (!user) {
      api.get("/auth/me").then(res => {
        setUser(res.data);
      }).catch(() => {
        router.push("/login");
      });
    }
  }, [user, router, setUser]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      logout();
      router.push("/login");
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-8 p-2">
          <h2 className="text-xl font-bold tracking-tight">Antigravity MCP</h2>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/profile" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${pathname === '/profile' ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
          <Link href="/settings/agents" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${pathname === '/settings/agents' ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <KeyRound className="h-5 w-5" />
            <span>AI Agents</span>
          </Link>
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <div className="px-4 py-2 mb-2 text-sm text-muted-foreground truncate">
            {user.email}
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-border flex items-center justify-end px-8">
          <ModeToggle />
        </header>
        <div className="p-8 max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
