"use server";

import { auth } from "@/auth";

const API_URL = process.env.MCP_API_URL || "http://localhost:3001";
const AUTH_SECRET = process.env.AUTH_SECRET || "";

export async function getTools() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/management/tools?userId=${encodeURIComponent(session.user.email)}`, {
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch tools");
  return res.json();
}

export async function createTool(data: { name: string; description: string; inputSchema: any }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/management/tools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": AUTH_SECRET,
    },
    body: JSON.stringify({ ...data, userId: session.user.email }),
  });
  if (!res.ok) throw new Error("Failed to create tool");
  return res.json();
}

export async function deleteTool(id: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/management/tools/${id}?userId=${encodeURIComponent(session.user.email)}`, {
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

  const res = await fetch(`${API_URL}/management/prompts?userId=${encodeURIComponent(session.user.email)}`, {
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export async function createPrompt(data: { name: string; description: string; content: string; arguments?: any }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/management/prompts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": AUTH_SECRET,
    },
    body: JSON.stringify({ ...data, userId: session.user.email }),
  });
  if (!res.ok) throw new Error("Failed to create prompt");
  return res.json();
}

export async function deletePrompt(id: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/management/prompts/${id}?userId=${encodeURIComponent(session.user.email)}`, {
    method: "DELETE",
    headers: {
      "x-sync-secret": AUTH_SECRET,
    },
  });
  if (!res.ok) throw new Error("Failed to delete prompt");
  return true;
}
