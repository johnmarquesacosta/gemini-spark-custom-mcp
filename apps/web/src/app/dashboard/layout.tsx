import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

// Todas as páginas do dashboard dependem de auth() (acessa headers/cookies),
// portanto nunca devem ser pré-renderizadas estaticamente.
export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can add auth check here later if needed
  return <DashboardLayout>{children}</DashboardLayout>;
}
