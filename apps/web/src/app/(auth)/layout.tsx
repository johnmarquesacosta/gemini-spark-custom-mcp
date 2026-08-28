import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-foreground">
          <h1 className="text-3xl font-bold tracking-tight">Antigravity MCP</h1>
          <p className="text-muted-foreground mt-2">
            Manage your users and AI agents
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
