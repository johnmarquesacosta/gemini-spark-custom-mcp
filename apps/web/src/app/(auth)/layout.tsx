import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 z-0 opacity-50 dark:opacity-40 transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle at 15% 50%, rgba(120, 119, 198, 0.3), transparent 25%), radial-gradient(circle at 85% 30%, rgba(200, 119, 198, 0.25), transparent 25%), radial-gradient(circle at 50% 80%, rgba(100, 150, 255, 0.2), transparent 25%)",
          filter: "blur(60px)",
        }}
      />
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md z-10 relative animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="mb-8 text-center text-foreground">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 shadow-inner border border-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Antigravity MCP
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your users and AI agents
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
