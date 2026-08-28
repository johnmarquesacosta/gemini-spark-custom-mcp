"use client";

import { useEffect } from "react";

export function EnvProvider({ apiUrl }: { apiUrl: string }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).ENV = { API_URL: apiUrl };
    }
  }, [apiUrl]);

  return null;
}
