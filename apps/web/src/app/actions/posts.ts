"use server";

import { api } from "../../lib/api";
import { revalidatePath } from "next/cache";

export async function createPost(data: Record<string, unknown>) {
  const result = await api.post("/posts", data);
  revalidatePath("/dashboard/posts");
  return result;
}

export async function updatePost(id: string, data: Record<string, unknown>) {
  const result = await api.patch(`/posts/${id}`, data);
  revalidatePath("/dashboard/posts");
  return result;
}

export async function publishPost(id: string) {
  const result = await api.patch(`/posts/${id}/publish`, {});
  revalidatePath("/dashboard/posts");
  return result;
}

export async function deletePost(id: string) {
  const result = await api.delete(`/posts/${id}`);
  revalidatePath("/dashboard/posts");
  return result;
}
