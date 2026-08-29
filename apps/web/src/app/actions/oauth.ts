"use server";

import { auth } from "@/auth";

export async function approveAuthorization(data: {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.MCP_API_URL}/oauth/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": process.env.AUTH_SECRET || "",
    },
    body: JSON.stringify({
      userId: session.user.email,
      client_id: data.client_id,
      redirect_uri: data.redirect_uri,
      code_challenge: data.code_challenge,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to approve authorization");
  }

  const result = await response.json();
  
  // Construct redirect URL
  const url = new URL(data.redirect_uri);
  url.searchParams.set("code", result.code);
  
  return url.toString();
}
