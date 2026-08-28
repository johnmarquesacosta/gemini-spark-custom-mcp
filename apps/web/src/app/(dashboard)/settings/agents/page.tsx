"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Trash2, KeyRound } from "lucide-react";
import { AiAgentDto } from "@repo/shared-types";

const createAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  scopes: z.string().min(1, "At least one scope is required (comma separated)"),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

export default function AgentsPage() {
  const [agents, setAgents] = useState<AiAgentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
  });

  const fetchAgents = async () => {
    try {
      const res = await api.get("/agents");
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAgents();
  }, []);

  const onSubmit = async (data: CreateAgentForm) => {
    try {
      setNewKey(null);
      const scopes = data.scopes.split(",").map((s) => s.trim());
      const res = await api.post("/agents", { name: data.name, scopes });
      setNewKey(res.data.apiKey);
      setAgents([res.data.agent, ...agents]);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this agent credential?"))
      return;
    try {
      await api.delete(`/agents/${id}`);
      setAgents(agents.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      alert("API Key copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Agents (MCP)</h1>
        <p className="text-muted-foreground mt-2">
          Manage credentials for your AI agents to access MCP routes
        </p>
      </div>

      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle>Create New Credential</CardTitle>
          <CardDescription>
            Generate a new API key for an AI agent
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g. claude-mcp-prod"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scopes">Scopes (comma separated)</Label>
              <Input
                id="scopes"
                placeholder="e.g. read:files, write:files"
                {...register("scopes")}
              />
              {errors.scopes && (
                <p className="text-sm text-destructive">
                  {errors.scopes.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Generate Key"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {newKey && (
        <Alert className="bg-green-900/20 border-green-900/50 text-green-600 dark:text-green-400">
          <KeyRound className="h-4 w-4" />
          <AlertTitle>API Key Generated Successfully!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2 text-foreground">
              Please copy this key now. You will not be able to see it again.
            </p>
            <div className="flex items-center space-x-2">
              <code className="bg-muted p-2 rounded text-primary break-all">
                {newKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Credentials</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : agents.length === 0 ? (
          <Card className="bg-card/50 p-8 text-center border-dashed">
            <p className="text-muted-foreground">
              No active AI agent credentials found.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="bg-card text-card-foreground shadow-sm"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">
                      ID: {agent.id}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRevoke(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>
                      Created: {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Last used:{" "}
                      {agent.lastUsedAt
                        ? new Date(agent.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
