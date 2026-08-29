import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { McpDashboardClient } from "./client";
import { getTools, getPrompts } from "../../actions/mcp";

export default async function McpDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  let tools = [];
  let prompts = [];
  
  try {
    const toolsRes = await getTools();
    tools = toolsRes.tools || toolsRes;
    
    const promptsRes = await getPrompts();
    prompts = promptsRes.prompts || promptsRes;
  } catch (e) {
    console.error("Error loading MCP resources", e);
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold">MCP Resources</h1>
            <p className="text-neutral-400 mt-1">Manage your Tools and Prompts</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Back to Dashboard
            </a>
          </div>
        </div>
        
        <McpDashboardClient initialTools={tools} initialPrompts={prompts} />
      </div>
    </div>
  );
}
