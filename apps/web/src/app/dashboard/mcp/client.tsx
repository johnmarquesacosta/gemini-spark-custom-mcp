"use client";

import { useState } from "react";
import { createTool, deleteTool, createPrompt, deletePrompt } from "../../actions/mcp";

export function McpDashboardClient({
  initialTools,
  initialPrompts,
}: {
  initialTools: Record<string, unknown>[];
  initialPrompts: Record<string, unknown>[];
}) {
  const [activeTab, setActiveTab] = useState<"tools" | "prompts">("tools");
  const [tools, setTools] = useState(initialTools);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); // for prompts
  const [schemaStr, setSchemaStr] = useState(""); // for tools

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let inputSchema = {};
      if (schemaStr) {
        try {
          inputSchema = JSON.parse(schemaStr);
        } catch {
          throw new Error("Invalid JSON in input schema");
        }
      }
      const newTool = await createTool({ name, description, inputSchema });
      setTools([...tools, newTool]);
      setName("");
      setDescription("");
      setSchemaStr("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await deleteTool(id);
      setTools(tools.filter((t) => t.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newPrompt = await createPrompt({ name, description, content });
      setPrompts([...prompts, newPrompt]);
      setName("");
      setDescription("");
      setContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("tools")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "tools"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab("prompts")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "prompts"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Prompts
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Tools Section */}
      {activeTab === "tools" && (
        <div className="space-y-8">
          <form onSubmit={handleCreateTool} className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-lg font-medium text-white">Create New Tool</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  placeholder="my-tool-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                <input
                  required
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  placeholder="What does this tool do?"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Input Schema (JSON)</label>
              <textarea
                value={schemaStr}
                onChange={(e) => setSchemaStr(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 h-24 font-mono text-sm"
                placeholder='{"type": "object", "properties": { ... }}'
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Tool"}
            </button>
          </form>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Your Tools</h3>
            {tools.length === 0 ? (
              <p className="text-neutral-500">No tools found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tools.map((tool) => (
                  <div key={tool.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{tool.name}</h4>
                      <p className="text-sm text-neutral-400 mt-1">{tool.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTool(tool.id)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prompts Section */}
      {activeTab === "prompts" && (
        <div className="space-y-8">
          <form onSubmit={handleCreatePrompt} className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-lg font-medium text-white">Create New Prompt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  placeholder="my-prompt-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                <input
                  required
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  placeholder="What is this prompt for?"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 h-24"
                placeholder="You are a helpful assistant..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Prompt"}
            </button>
          </form>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Your Prompts</h3>
            {prompts.length === 0 ? (
              <p className="text-neutral-500">No prompts found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{prompt.name}</h4>
                      <p className="text-sm text-neutral-400 mt-1">{prompt.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
