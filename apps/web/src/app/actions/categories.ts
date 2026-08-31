"use server";

import { api } from "../../lib/api";
import { revalidatePath } from "next/cache";

export async function createCategory(data: { name: string; slug: string; wordpressCategoryId?: number }) {
  const result = await api.post("/categories", data);
  revalidatePath("/dashboard/categories");
  return result;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; wordpressCategoryId?: number }) {
  const result = await api.patch(`/categories/${id}`, data);
  revalidatePath("/dashboard/categories");
  return result;
}

export async function deleteCategory(id: string) {
  const result = await api.delete(`/categories/${id}`);
  revalidatePath("/dashboard/categories");
  return result;
}
