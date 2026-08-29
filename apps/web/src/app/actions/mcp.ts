"use server";

import { auth } from "@/auth";

const API_URL = process.env.MCP_API_URL || "http://localhost:3001";
const AUTH_SECRET = process.env.AUTH_SECRET || "";

export async function getTools() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/tools?userId=${encodeURIComponent(session.user.email)}`, {
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch tools");
  return res.json();
}

export async function createTool(data: { name: string; description: string; inputSchema: Record<string, unknown> }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/tools?userId=${encodeURIComponent(session.user.email)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": AUTH_SECRET,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tool");
  return res.json();
}

export async function deleteTool(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/tools/${id}?userId=${encodeURIComponent(session.user.email)}`, {
    method: "DELETE",
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
  });
  if (!res.ok) throw new Error("Failed to delete tool");
  return true;
}

export async function getPrompts() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/prompts?userId=${encodeURIComponent(session.user.email)}`, {
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export async function createPrompt(data: { name: string; description: string; content: string; arguments?: unknown }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/prompts?userId=${encodeURIComponent(session.user.email)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": AUTH_SECRET,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create prompt");
  return res.json();
}

export async function deletePrompt(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/mcp-management/prompts/${id}?userId=${encodeURIComponent(session.user.email)}`, {
    method: "DELETE",
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
  });
  if (!res.ok) throw new Error("Failed to delete prompt");
  return true;
}
